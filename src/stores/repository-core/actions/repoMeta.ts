import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { Repo } from '@/types/repository'
// Repo Meta

export const getRepositoryMetaFromContract = async (id: string): Promise<{ result: Repo }> => {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, 'use_wallet')

  return contract.viewState({
    function: 'getRepository',
    payload: {
      id
    }
  })
}
