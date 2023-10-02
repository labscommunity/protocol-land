import Arweave from 'arweave'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { toArrayBuffer } from '@/helpers/toArrayBuffer'
import { waitFor } from '@/helpers/waitFor'
import { useGlobalStore } from '@/stores/globalStore'

const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})

export async function uploadUserAvatar(avatar: File) {
  const address = useGlobalStore.getState().authState.address
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const data = (await toArrayBuffer(avatar)) as ArrayBuffer
  await waitFor(500)

  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: avatar.type },
    { name: 'Creator', value: address || '' },
    { name: 'Type', value: 'avatar-update' }
  ]

  const transaction = await arweave.createTransaction({
    data
  })

  inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

  const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

  if (!dataTxResponse.id) {
    throw new Error('Failed to post Git repository')
  }

  return dataTxResponse.id
}
