import { StateCreator } from 'zustand'

import { CombinedSlices } from '../types'
import { UserSlice } from './types'

const initialUserState = {
  userRepos: []
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
    }
  }
})

export default createUserSlice
