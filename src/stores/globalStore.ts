import { enableMapSet } from 'immer'
import { StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'

import createAuthSlice from './auth'
import createBranchSlice from './branch'
import createHackathonSlice from './hackathon'
import createIssuesSlice from './issues'
import createOrganizationSlice from './organization'
import createPullRequestSlice from './pull-request'
import createRepoCoreSlice from './repository-core'
import { CombinedSlices } from './types'
import createUserSlice from './user'
enableMapSet()

const withMiddlewares = <T>(f: StateCreator<T, [['zustand/immer', never]], []>) => devtools(immer<T>(f))

export const useGlobalStore = createWithEqualityFn(
  withMiddlewares<CombinedSlices>((...args) => ({
    ...createAuthSlice(...args),
    ...createUserSlice(...args),
    ...createRepoCoreSlice(...args),
    ...createBranchSlice(...args),
    ...createPullRequestSlice(...args),
    ...createIssuesSlice(...args),
    ...createHackathonSlice(...args),
    ...createOrganizationSlice(...args)
  })),
  shallow
)
