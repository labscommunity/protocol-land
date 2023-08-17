import { Repo } from '@/types/repository'

export type AppState = {
  auth: AuthState
  user: UserState
}

export type Actions = {
  login: (value: AuthState) => void
  logout: () => void
  setUserRepositories: (repos: Array<Repo>) => void
  getUserRepositoryByTxId: (txId: string) => Repo | undefined
}

export type AuthState = {
  isLoggedIn: boolean
  address: string | null
  method: string | null
}

export type UserState = {
  repositories: Array<Repo>
}
