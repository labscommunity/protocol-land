import Transaction, { Tag } from 'arweave/web/lib/transaction'
import { DataItem } from 'warp-arbundles'

import { createAndSignDataItem } from '@/helpers/wallet/createAndSignDataItem'
import { getSigner } from '@/helpers/wallet/getSigner'

export async function createSignedQueuePayload(tx: Transaction | DataItem) {
  const data = tx.data
  let tags = tx.tags as Tag[]

  tags = tags.map((tag) => {
    const name = tag.get('name', { decode: true, string: true })
    const value = tag.get('value', { decode: true, string: true })

    return { name, value }
  }) as Tag[]

  const signer = await getSigner()
  const dataItem = await createAndSignDataItem(data, tags, signer)

  return dataItem
}
