import { Tag } from 'arweave/web/lib/transaction'
import { createData, DataItem } from 'warp-arbundles'

import { useGlobalStore } from '@/stores/globalStore'

export async function createAndSignDataItem(data: string | Uint8Array, tags: Tag[], signer: any) {
  const strategy = useGlobalStore.getState().authState.method

  if (strategy === 'arconnect') {
    const formattedData = typeof data === 'string' ? data : new Uint8Array(data)

    const signedRawDataItem = await (window.arweaveWallet as any).signDataItem({
      data: formattedData,
      tags
    })

    const dataItemSigned = new DataItem(new Uint8Array(signedRawDataItem) as any)
    const rawSignatureSigned = dataItemSigned.rawSignature

    await dataItemSigned.setSignature(rawSignatureSigned)

    return dataItemSigned
  }

  const dataItem = createData(data, signer, { tags })
  await dataItem.sign(signer)

  return dataItem
}
