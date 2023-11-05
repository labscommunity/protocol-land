import { UserContributionData } from '@/lib/user'
import { Repo } from '@/types/repository'
import { User } from '@/types/user'

export interface UserSlice {
  userState: UserState
  userActions: UserActions
}

export type UserState = {
  userRepos: Repo[]
  userDetails: User
}

export type UserActions = {
  setUserRepositories: (repos: Array<Repo>) => void
  setUserDetails: () => Promise<void>
  getUserRepositoryMetaById: (id: string) => Repo | undefined
  fetchUserDetailsByAddress: (address: string) => Promise<User>
  saveUserDetails: (details: Partial<User>, address: string) => Promise<void>
  updateUserContributionStats: (data: UserContributionData) => Promise<void>
}
