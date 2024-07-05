import { Tag } from 'arweave/web/lib/transaction'

import { toArrayBuffer } from '@/helpers/toArrayBuffer'
import { waitFor } from '@/helpers/waitFor'
import { getSigner } from '@/helpers/wallet/getSigner'
import { signAndSendTx } from '@/helpers/wallet/signAndSend'
import { useGlobalStore } from '@/stores/globalStore'

export async function uploadLogo(file: File, hackathonId: string, logoType: string) {
  const address = useGlobalStore.getState().authState.address
  const userSigner = await getSigner()

  const data = (await toArrayBuffer(file)) as ArrayBuffer
  await waitFor(500)

  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: file.type },
    { name: 'Creator', value: address || '' },
    { name: 'Type', value: logoType },
    { name: 'Hackathon-ID', value: hackathonId }
  ] as Tag[]

  const dataTxResponse = await signAndSendTx(data, inputTags, userSigner)

  if (!dataTxResponse) {
    throw new Error('Failed to post logo')
  }

  return dataTxResponse
}
