import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import createAuthSlice from './auth'
import createRepoSlice from './repository'
import { CombinedSlices } from './types'

const withMiddlewares = <T>(f: StateCreator<T, [['zustand/immer', never]], []>) => devtools(immer<T>(f))

export const useGlobalStore = create(
  withMiddlewares<CombinedSlices>((...args) => ({
    ...createAuthSlice(...args),
    ...createRepoSlice(...args)
  }))
)
