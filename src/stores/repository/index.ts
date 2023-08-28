import { StateCreator } from 'zustand'

import { CombinedSlices } from '../types'
import { RepositorySlice } from './types'

const initialRepositoryState = {
  userRepos: []
}

const createRepoSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], RepositorySlice> = (
  set,
  get
) => ({
  repositoryState: initialRepositoryState,
  repositoryActions: {
    setUserRepositories: (repos) =>
      set((state) => {
        state.repositoryState.userRepos = repos
      }),
    getUserRepositoryMetaById: (id) => {
      const repo = get().repositoryState.userRepos.find((repo) => repo?.id === id)

      return repo
    }
  }
})

export default createRepoSlice
