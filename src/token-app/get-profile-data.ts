import { LensClient, production, MediaSetFragment } from '@lens-protocol/client'

const lensClient = new LensClient({
  environment: production,
})

export const getProfileData = async (profileId: string) => {
  return await lensClient.profile.fetch({
    profileId,
  })
}
