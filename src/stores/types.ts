import { Repo } from '@/types/repository'

import { AuthSlice } from './auth/types'
import { BranchSlice } from './branch/types'
import { HackathonSlice } from './hackathon/types'
import { IssuesSlice } from './issues/types'
import { PullRequestSlice } from './pull-request/types'
import { RepoCoreSlice } from './repository-core/types'
import { UserSlice } from './user/types'

export type CombinedSlices = AuthSlice &
  UserSlice &
  RepoCoreSlice &
  BranchSlice &
  PullRequestSlice &
  IssuesSlice &
  HackathonSlice

export type UserState = {
  repositories: Array<Repo>
}
