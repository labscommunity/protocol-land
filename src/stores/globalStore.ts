import { StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'

import createAuthSlice from './auth'
import createRepoCoreSlice from './repository-core'
import { CombinedSlices } from './types'
import createUserSlice from './user'

const withMiddlewares = <T>(f: StateCreator<T, [['zustand/immer', never]], []>) => devtools(immer<T>(f))

export const useGlobalStore = createWithEqualityFn(
  withMiddlewares<CombinedSlices>((...args) => ({
    ...createAuthSlice(...args),
    ...createUserSlice(...args),
    ...createRepoCoreSlice(...args)
  })),
  shallow
)
