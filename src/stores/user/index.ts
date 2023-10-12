import { StateCreator } from 'zustand'

import { withAsync } from '@/helpers/withAsync'

import { CombinedSlices } from '../types'
import { getUserDetailsByAddressFromContract, getUserDetailsFromContract, saveUserDetails } from './actions'
import { UserSlice } from './types'

const initialUserState = {
  userRepos: [],
  userDetails: {
    statistics: {
      commits: [],
      pullRequests: [],
      issues: []
    }
  }
}

const createUserSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], UserSlice> = (set, get) => ({
  userState: initialUserState,
  userActions: {
    setUserRepositories: (repos) =>
      set((state) => {
        state.userState.userRepos = repos
      }),
    getUserRepositoryMetaById: (id) => {
      const repo = get().userState.userRepos.find((repo) => repo?.id === id)

      return repo
    },
    setUserDetails: async () => {
      const { response } = await withAsync(() => getUserDetailsFromContract())

      if (response && response.result) {
        set((state) => {
          state.userState.userDetails = response.result
        })
      }
    },
    fetchUserDetailsByAddress: async (address: string) => {
      const { response } = await withAsync(() => getUserDetailsByAddressFromContract(address))

      if (response) {
        return response.result
      }

      return {
        statistics: {
          commits: [],
          pullRequests: [],
          issues: []
        }
      }
    },
    updateUserContributionStats: async (data) => {
      set((state) => {
        state.userState.userDetails.statistics = data
      })
    },
    saveUserDetails: async (details, address: string) => {
      const { response } = await withAsync(() => saveUserDetails(details, address))

      if (response) {
        const userDetails = response.result

        set((state) => {
          state.userState.userDetails = userDetails
        })
      }
    }
  }
})

export default createUserSlice
