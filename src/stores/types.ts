import { Repo } from '@/types/repository'

import { AuthSlice } from './auth/types'
import { RepoCoreSlice } from './repository-core/types'
import { UserSlice } from './user/types'

export type CombinedSlices = AuthSlice & UserSlice & RepoCoreSlice

export type UserState = {
  repositories: Array<Repo>
}
