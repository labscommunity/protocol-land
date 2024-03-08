import { Tag } from 'arweave/web/lib/transaction'
import axios from 'axios'
import toast from 'react-hot-toast'

import { createAndSignDataItem } from '@/helpers/wallet/createAndSignDataItem'
import { useGlobalStore } from '@/stores/globalStore'

import { bundleAndSignData } from './utils'

export async function subsidizeAndSubmitTx(data: string | Uint8Array, tags: Tag[], signer: any) {
  const address = useGlobalStore.getState().authState.address

  const dataItem = await createAndSignDataItem(data, tags, signer)

  const dataItems = [dataItem]

  const bundle = await bundleAndSignData(dataItems, signer)

  const dataBinary = bundle.getRaw()

  try {
    const res = (
      await axios.post(
        'https://subsidize.saikranthi.dev/api/v1/postrepo',
        {
          txBundle: dataBinary,
          platform: 'UI',
          owner: address
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      )
    ).data

    if (!res || !res.success) {
      throw new Error('Failed to subsidize your transaction. Please try again.')
    }

    return await dataItem.id
  } catch (error: any) {
    toast.error(error.message)
  }
}
