import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { withAsync } from '@/helpers/withAsync'
import { Repo } from '@/types/repository'
import { User } from '@/types/user'

export const getUserDetailsFromContract = async (): Promise<{ result: User }> => {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID)

  return contract.viewState({
    function: 'getUserDetails'
  })
}

export const getUserDetailsByAddressFromContract = async (address: string): Promise<{ result: User }> => {
  const contract = getWarpContract(CONTRACT_TX_ID)

  const {
    cachedValue: {
      state: { users }
    }
  } = await contract.readState()

  const userDetails = users[address]

  if (!userDetails) return { result: {} }

  return { result: userDetails }
}

export const saveUserDetails = async (details: User, address: string): Promise<{ result: User }> => {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateProfileDetails',
    payload: details || {}
  })

  const {
    cachedValue: {
      state: { users }
    }
  } = await contract.readState()

  const userDetails = users[address]

  if (!userDetails) return { result: {} }

  return { result: userDetails }
}

export const fetchUserRepos = async (address: string) => {
  let repos: Repo[] = []

  const contract = getWarpContract(CONTRACT_TX_ID)

  const { response: ownerReposResponse } = await withAsync(() =>
    contract.viewState({
      function: 'getRepositoriesByOwner',
      payload: {
        owner: address
      }
    })
  )

  const { response: collabResponse } = await withAsync(() =>
    contract.viewState({
      function: 'getRepositoriesByContributor',
      payload: {
        contributor: address
      }
    })
  )

  if (ownerReposResponse) {
    repos = [...repos, ...ownerReposResponse.result]
  }

  if (collabResponse) {
    repos = [...repos, collabResponse]
  }

  return repos
}
