import { MediaSetFragment, ProfileFragment } from "@lens-protocol/client"
import { getPublicationsBySymbols } from "../get-pulications-by-token-symbols.js"
import { getProfileData } from "./get-profile-data.js"
import { getTokenDataBySymbol } from "./get-token-data.js"
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const MAX_RESULTS = Number(process.env.MAX_RESULTS) ?? 20

/**
 * Modify the symbols
 */
const SYMBOLS = ['btc', 'eth', 'doge']

async function exportToTokenApp(symbols: string[]) {
  const publications = await getPublicationsBySymbols(symbols)

  
  const edges = await Promise.all(publications.map(async publication => {
    const profile = await getProfileData(publication.profile_id) as ProfileFragment
    
    const matchingSymbol = await getMatchingSymbol(symbols, publication.content)

    const token = await getTokenDataBySymbol(matchingSymbol)

    return {
      cursor: `Post:${publication.post_id}`,
      node: {
        id: publication.post_id,
        createdAt: publication.block_timestamp.value,
        text: publication.content,
        profile: {
          id: profile.id,
          rawHandle: profile.handle,
          displayName: profile.handle,
          handle: profile.handle,
          avatar: (profile?.picture as MediaSetFragment)?.original?.url
            ? convertAvatarIfIpfs((profile?.picture as MediaSetFragment)?.original?.url)
            : null
        },
        tokens: [token]
      }
    }
  }))

  return {
    me: {
      feed: {
        edges: edges.slice(0, Number(MAX_RESULTS)),
        "pageInfo": {
          "hasNextPage": false,
          "hasPreviousPage": false,
          "startCursor": "cursor:1",
          "endCursor": "cursor:-1"
        }
      }
    }
  }
}

function getMatchingSymbol(symbols: string[], content: string): string {
  for (const symbol of symbols) {
    if (content.toLowerCase().includes(symbol.toLowerCase())) {
      return symbol
    }
  }
  // shouldn't happen
  return ''
}

function convertAvatarIfIpfs(url: string): string {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  } else {
    return url
  }
}

;(async () => {
  const postsData = await exportToTokenApp(SYMBOLS)
  fs.writeFileSync('./src/token-app/data.json', JSON.stringify(postsData))
})()
