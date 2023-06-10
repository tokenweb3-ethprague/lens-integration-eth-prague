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

const keyFilename = './keyfile.json'
const postsFilename = './lens-posts.json'
const lensClient = new LensClient({
  environment: production,
})

const rawTokenData = fs.readFileSync('./token-data.json');
let tokens: HackathonTokenData[] = JSON.parse(rawTokenData.toString('utf8'));

const getTokenDataBySymbol = (symbol: string): HackathonTokenData | undefined => {
  return tokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase())
}

const convertAvatarIfIpfs = (url: string): string => {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://','https://ipfs.io/ipfs/')
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
    ORDER BY block_timestamp DESC
    LIMIT 1000
    `

  const options = {
    query: query,
    location: 'US',
  }

  const [rows] = await client.query(options)

  let edges = []

  const filters = ['btc', 'aave', 'eth', 'shib', 'pepe']

  const filteredData = rows.filter((row) => {
    // return true when post contains one or more of the filter items
    let includesTokenSymbol = false

    for (const symbol of filters) {
      if (row.content.includes(symbol)) {
        includesTokenSymbol = true
        break
      }
    }

    return includesTokenSymbol
  });

  for (const row of filteredData) {
    const profile = await getProfileInfo(row.profile_id)

    for (const symbol of filters) {
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
        "edges": edges.slice(0,20),
        "pageInfo": {
          "hasNextPage": false,
          "hasPreviousPage": false,
          "startCursor": "cursor:1",
          "endCursor": "cursor:-1"
        }
      }
    }
  }
  fs.writeFileSync('./finalJson.json', JSON.stringify(final))
}

const getProfileInfo = async (profileId: string) => {
  return await lensClient.profile.fetch({
    profileId,
  })
}

  ; (async () => {
    console.log('Getting latest posts...')
    await getLatestPosts()
    console.log('Done!')
  })()
