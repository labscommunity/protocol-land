import { Tag } from 'arweave/web/lib/transaction'

import { toArrayBuffer } from '@/helpers/toArrayBuffer'
import { waitFor } from '@/helpers/waitFor'
import { getSigner } from '@/helpers/wallet/getSigner'
import { signAndSendTx } from '@/helpers/wallet/signAndSend'
import { useGlobalStore } from '@/stores/globalStore'

export async function uploadDetailsReadme(content: string, hackathonId: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })

  const address = useGlobalStore.getState().authState.address
  const userSigner = await getSigner()

  const data = (await toArrayBuffer(blob)) as ArrayBuffer
  await waitFor(500)

  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: blob.type },
    { name: 'Creator', value: address || '' },
    { name: 'Type', value: 'hackathon-details' },
    { name: 'Hackathon-ID', value: hackathonId }
  ] as Tag[]

  const dataTxResponse = await signAndSendTx(data, inputTags, userSigner)

  if (!dataTxResponse) {
    throw new Error('Failed to post hackathon details')
  }

  return dataTxResponse
}
