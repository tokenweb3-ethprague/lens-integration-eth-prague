import { LensClient, production, MediaSetFragment } from '@lens-protocol/client'
import { BigQuery } from '@google-cloud/bigquery'
import fs from 'fs'

type HackathonTokenData = {
  id: string,
  symbol: string,
  tokenUrl: string,
  icon: string,
  description: string,
  name: string,
  investedViaPost: number,
  changePercent24h: number,
}

type LensPostData = {
  "post_id": string,
  "contract_publication_id": string,
  "profile_id": string,
  "content_uri": string,
  "s3_metadata_location": string,
  "collect_nft_address": string,
  "reference_implementation": string,
  "reference_return_data": string,
  "is_related_to_post": boolean,
  "is_related_to_comment": boolean,
  "is_metadata_processed": boolean,
  "has_error": boolean,
  "metadata_error_reason": string,
  "tx_hash": string,
  "is_hidden": boolean,
  "timeout_request": boolean,
  "app_id": string,
  "block_timestamp": {
    "value": string,
  },
  "created_block_hash": string,
  "metadata_version": string,
  "language": string,
  "region": string,
  "content_warning": string,
  "main_content_focus": string,
  "tags_vector": string,
  "custom_filters_gardener_flagged": boolean,
  "content": string,
  "is_gated": boolean,
  "is_data_availability": boolean,
  "data_availability_proofs": string,
  "datastream_metadata": {
    "uuid": string,
    "source_timestamp": number,
  }
  "data_availability_verification_failed": boolean
}

const keyFilename = './keyfile.json'
const postsFilename = './output/lens-posts.json'
const lensClient = new LensClient({
  environment: production,
})

const rawTokenData = fs.readFileSync('./src/token-data.json');
let tokens: HackathonTokenData[] = JSON.parse(rawTokenData.toString('utf8'));

const getTokenDataBySymbol = (symbol: string): HackathonTokenData | undefined => {
  return tokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase())
}

const convertAvatarIfIpfs = (url: string): string => {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  } else {
    return url
  }
}

const getLatestPosts = async () => {
  const client = new BigQuery({ keyFilename })

  const query = `
    SELECT *
    FROM lens-public-data.polygon.public_profile_post
    WHERE main_content_focus = "TEXT_ONLY" 
    AND content IS NOT NULL 
    AND content_warning IS NULL
    AND is_related_to_post IS NULL
    AND s3_metadata_location IS NOT NULL
    AND has_error = false
    AND is_metadata_processed = true
    AND content LIKE '%aave%' OR content LIKE '%btc%' OR content LIKE '%eth%'
    ORDER BY block_timestamp DESC
    LIMIT 100
    `

  const options = {
    query: query,
    location: 'US',
  }

  const [rows] = await client.query(options)

  let edges = []

  const symbols = ['ARB','AAVE', 'btc', 'aave', 'eth', 'shib', 'pepe', 'BTC', 'ETH',]

  const filteredData = rows.filter((row: LensPostData) => {
    // return true when post contains one or more of the filter items
    let includesTokenSymbol = false

    for (const symbol of symbols) {
      //if (row.content.includes(symbol)) {
      if (row.content != null && row.content.includes(symbol)) {
        includesTokenSymbol = true
        break
      }
    }

    return includesTokenSymbol
  });

  for (const row of filteredData) {
    const profile = await getProfileInfo(row.profile_id)

    for (const symbol of symbols) {
      if (row.content.includes(symbol)) {
        const token = getTokenDataBySymbol(symbol)
        const edge = {
          "cursor": "cursor", // just a random string, more for the fronted, as long as each one is different it works
          "node": {
            "id": row.profile_id,
            "createdAt": row.block_timestamp.value,
            "text": row.content,
            "profile": {
              "id": row.profile_id,//posts- "profile_id": "0x6f92",
              "rawHandle": profile?.handle, // from the sdk profile
              "displayName": profile?.handle, // same of handle
              "avatar": (profile?.picture as MediaSetFragment)?.original?.url ? convertAvatarIfIpfs((profile?.picture as MediaSetFragment)?.original?.url) : null, // from the sdk profile
              "handle": profile?.handle // sdk
            },
            "tokens": [token]
          }
        }
        edges.push(edge)
        break
      }
    }
  }

  const textOnlyPosts = {
    date: new Date().toISOString(),
    posts: filteredData
  }

  fs.writeFileSync(postsFilename, JSON.stringify(textOnlyPosts))
  const final = {
    "me": {
      "feed": {
        "edges": edges.slice(0, 20),
        "pageInfo": {
          "hasNextPage": false,
          "hasPreviousPage": false,
          "startCursor": "cursor:1",
          "endCursor": "cursor:-1"
        }
      }
    }
  }
  fs.writeFileSync('./output/finalJson.json', JSON.stringify(final))
}

const getProfileInfo = async (profileId: string) => {
  return await lensClient.profile.fetch({
    profileId,
  })
}

  ; (async () => {
    console.log('Getting latest trending tokens posts...')
    await getLatestPosts()
    console.log('Done!')
  })()
