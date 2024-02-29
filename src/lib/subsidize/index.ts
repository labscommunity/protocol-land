import { Tag } from 'arweave/web/lib/transaction'
import axios from 'axios'
import toast from 'react-hot-toast'
import { createData } from 'warp-arbundles'

import { OTHENT_PAY_PL_NODE_ID } from '@/helpers/constants'

import { bundleAndSignData } from './utils'

export async function subsidizeAndSubmitTx(data: string | Uint8Array, tags: Tag[], signer: any) {
  const dataItem = createData(data, signer, { tags })
  await dataItem.sign(signer)

  const dataItems = [dataItem]

  const bundle = await bundleAndSignData(dataItems, signer)

  const dataBinary = bundle.getRaw()
  const hexBundle = dataBinary.toString('hex')

  try {
    const res = (
      await axios.post('https://subsidising.othent.io/subsidise', {
        hexBundle,
        nodeAccountId: OTHENT_PAY_PL_NODE_ID
      })
    ).data

    if (!res || !res.id) {
      throw new Error('Failed to subsidize your transaction. Please try again.')
    }

    return await dataItem.id
  } catch (error: any) {
    toast.error(error.message)
  }
}
