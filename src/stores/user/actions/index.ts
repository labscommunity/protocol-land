import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { withAsync } from '@/helpers/withAsync'
import { Repo } from '@/types/repository'
import { User } from '@/types/user'

export const getUserAddressToUserMap = async () => {
  const userMap = new Map<string, User>()
  const contract = getWarpContract(CONTRACT_TX_ID)
  const state = (await contract.readState()).cachedValue.state
  const users = state.users
  Object.entries(users).forEach(([address, user]) => {
    userMap.set(address, user as User)
  })
  return userMap
}

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

  const userDetails = users[address] as User

  if (!userDetails)
    return {
      result: {
        statistics: {
          commits: [],
          pullRequests: [],
          issues: []
        }
      }
    }

  return { result: userDetails }
}

export const saveUserDetails = async (details: Partial<User>, address: string): Promise<{ result: User }> => {
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

  if (!userDetails)
    return {
      result: {
        statistics: {
          commits: [],
          pullRequests: [],
          issues: []
        }
      }
    }

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
    repos = [...repos, ...collabResponse.result]
  }

  return repos
}
