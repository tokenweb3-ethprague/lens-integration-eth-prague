import { MediaSetFragment, ProfileFragment } from "@lens-protocol/client"
import { getPublicationsBySymbols } from "../get-pulications-by-token-symbols.js"
import { getProfileData } from "./get-profile-data.js"

const SYMBOLS = ['btc', 'eth', 'doge']

async function exportToTokenApp(symbols: string[]) {
  const publications = await getPublicationsBySymbols(symbols)

  const edges = publications.map(async publication => {
    const profile = await getProfileData(publication.profile_id) as ProfileFragment
    const tokens: unknown = []

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
        tokens: tokens as unknown,
      }
    }
  })
}

const convertAvatarIfIpfs = (url: string): string => {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  } else {
    return url
  }
}

exportToTokenApp(SYMBOLS)
