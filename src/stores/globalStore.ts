import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { Actions, AppState, AuthState } from './types'

const withMiddlewares = <T>(f: StateCreator<T, [['zustand/immer', never]], []>) => devtools(immer<T>(f))

const initialAuthState = {
  isLoggedIn: false,
  address: null,
  method: null
}

const initialUserState = {
  repositories: []
}

export const useGlobalStore = create(
  withMiddlewares<AppState & Actions>((set, get) => ({
    auth: initialAuthState,
    user: initialUserState,
    login: (value: AuthState) =>
      set((state) => {
        state.auth = value
      }),
    logout: () =>
      set((state) => {
        state.auth = initialAuthState
      }),
    setUserRepositories: (repos) =>
      set((state) => {
        state.user.repositories = repos
      }),
    getUserRepositoryMetaByTxId: (txId) => {
      const repo = get().user.repositories.find((repo) => repo.dataTxId === txId)

      return repo
    }
  }))
)
