import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { Repo, WarpReadState } from '@/types/repository'
// Repo Meta

export const getRepositoryMetaFromContract = async (id: string): Promise<{ result: Repo }> => {
  const contract = getWarpContract(CONTRACT_TX_ID)

  return contract.viewState({
    function: 'getRepository',
    payload: {
      id
    }
  })
}

export const isRepositoryNameAvailable = async (name: string): Promise<boolean> => {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()
  userSigner.getAddress = () => userSigner.signer.getActiveAddress()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  const { result: isAvailable } = await contract.viewState({
    function: 'isRepositoryNameAvailable',
    payload: { name }
  })

  return isAvailable
}

export const searchRepositories = async (query: string): Promise<{ result: Repo[] }> => {
  const contract = getWarpContract(CONTRACT_TX_ID)

  const {
    cachedValue: {
      state: { repos }
    }
  }: WarpReadState = await contract.readState()

  const repoList = Object.values(repos)
  const ownerRepos = repoList.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

  return { result: ownerRepos }
}
