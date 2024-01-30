import Arweave from 'arweave/web'
import { Tag } from 'arweave/web/lib/transaction'
import { createData } from 'warp-arbundles'

import { useGlobalStore } from '@/stores/globalStore'

export async function signAndSendTx(data: string | ArrayBuffer | Uint8Array, tags: Tag[], signer: any) {
  const isArconnect = useGlobalStore.getState().authState.method === 'arconnect'

  if (isArconnect) {
    const arweave = new Arweave({
      host: 'ar-io.net',
      port: 443,
      protocol: 'https'
    })

    const transaction = await arweave.createTransaction({
      data
    })

    tags.forEach((tag) => transaction.addTag(tag.name, tag.value))

    const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

    return dataTxResponse.id
  }

  const node = 'https://turbo.ardrive.io'

  if (data instanceof ArrayBuffer) {
    data = new Uint8Array(data)
  }

  const dataItem = createData(data as string | Uint8Array, signer, { tags })

  await dataItem.sign(signer)

  const res = await fetch(`${node}/tx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: dataItem.getRaw()
  })

  if (res.status >= 400)
    throw new Error(`[ turbo ] Posting repo with turbo failed. Error: ${res.status} - ${res.statusText}`)

  return dataItem.id
}
