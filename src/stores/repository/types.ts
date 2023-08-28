import { Repo } from '@/types/repository'

export interface RepositorySlice {
  repositoryState: RepositoryState
  repositoryActions: RepositoryActions
}

export type RepositoryState = {
  userRepos: Repo[]
}

export type RepositoryActions = {
  setUserRepositories: (repos: Array<Repo>) => void
  getUserRepositoryMetaById: (id: string) => Repo | undefined
}
