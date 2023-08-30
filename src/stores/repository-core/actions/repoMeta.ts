import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { withAsync } from '@/helpers/withAsync'
// Repo Meta

export const getRepositoryMetaFromContract = async (id: string) => {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, 'use_wallet')

  return withAsync(() =>
    contract.viewState({
      function: 'getRepository',
      payload: {
        id
      }
    })
  )
}
