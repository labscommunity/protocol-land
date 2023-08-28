import { Repo } from '@/types/repository'

import { AuthSlice } from './auth/types'
import { RepositorySlice } from './repository/types'

export type CombinedSlices = AuthSlice & RepositorySlice

export type AppState = {
  auth: AuthState
  user: UserState
}

export type Actions = {
  login: (value: AuthState) => void
  logout: () => void
  setUserRepositories: (repos: Array<Repo>) => void
  getUserRepositoryMetaById: (id: string) => Repo | undefined
}

export type AuthState = {
  isLoggedIn: boolean
  address: string | null
  method: string | null
}

export type UserState = {
  repositories: Array<Repo>
}
