import { StateCreator } from 'zustand'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { withAsync } from '@/helpers/withAsync'
import { User } from '@/types/user'

import { CombinedSlices } from '../types'
import {
  getUserAddressToUserMap,
  getUserDetailsByAddressFromContract,
  getUserDetailsFromContract,
  saveUserDetails
} from './actions'
import { UserSlice } from './types'

const initialUserState = {
  userRepos: [],
  userDetails: {
    statistics: {
      commits: [],
      pullRequests: [],
      issues: []
    }
  },
  allUsers: new Map<string, User>()
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
      const { response, error } = await withAsync(() => saveUserDetails(details, address))

      if (response) {
        const userDetails = response.result

        set((state) => {
          state.userState.userDetails = userDetails
        })

        trackGoogleAnalyticsEvent('User', 'Update user details', 'User details update', {
          ...details,
          result: 'SUCCESS'
        })
      }

      if (error) {
        throw error
      }
    },
    updateAllUsers: async () => {
      const { response } = await withAsync(() => getUserAddressToUserMap())
      if (response) {
        set((state) => {
          state.userState.allUsers = response
        })
      }
    }
  }
})

export default createUserSlice
