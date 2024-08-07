import { getTags } from '@/helpers/getTags'

import { sendMessage } from '../contract'

export async function decentralizeRepo(repoId: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Decentralize-Repo',
      Id: repoId
    })
  })
}
