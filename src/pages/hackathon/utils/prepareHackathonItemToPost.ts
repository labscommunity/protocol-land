import { v4 as uuid } from 'uuid'

import { withAsync } from '@/helpers/withAsync'
import { NewHackatonItem } from '@/types/hackathon'

import { uploadDetailsReadme } from './uploadDetailsReadme'
import { uploadLogo } from './uploadLogo'

export async function prepareHackathonItemToPost(hackathonItem: PrepareHackathonItemProps): Promise<NewHackatonItem> {
  const { hackathonLogoFile, hostLogoFile, details, ...rest } = hackathonItem

  const id = uuid()
  const { response: hackathonLogo } = await withAsync(() => uploadLogo(hackathonLogoFile, id, 'hackathon-logo'))

  if (!hackathonLogo) throw 'Error uploading hackathon logo'
  const { response: hostLogo } = await withAsync(() => uploadLogo(hostLogoFile, id, 'host-logo'))

  if (!hostLogo) throw 'Error uploading host logo'
  const { response: descriptionTxId } = await withAsync(() => uploadDetailsReadme(details, id))

  if (!descriptionTxId) throw 'Error posting hackathon details'

  return {
    ...rest,
    id,
    hackathonLogo: hackathonLogo,
    hostLogo: hostLogo,
    descriptionTxId: descriptionTxId
  }
}

type PrepareHackathonItemProps = Omit<NewHackatonItem, 'id' | 'hackathonLogo' | 'hostLogo' | 'descriptionTxId'> & {
  hackathonLogoFile: File
  hostLogoFile: File
  details: string
}
