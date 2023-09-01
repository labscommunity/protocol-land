import { Repo } from '@/types/repository'

export interface UserSlice {
  userState: UserState
  userActions: UserActions
}

export type UserState = {
  userRepos: Repo[]
}

export type UserActions = {
  setUserRepositories: (repos: Array<Repo>) => void
  getUserRepositoryMetaById: (id: string) => Repo | undefined
}
