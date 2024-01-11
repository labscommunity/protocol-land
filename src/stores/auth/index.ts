import { StateCreator } from 'zustand'

import { CombinedSlices } from '../types'
import { AuthSlice, AuthState } from './types'

const initialAuthState = {
  isLoggedIn: false,
  address: null,
  method: null
}

const createAuthSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], AuthSlice> = (set, get) => ({
  authState: initialAuthState,
  authActions: {
    login: async (value: AuthState) => {
      set((state) => {
        state.authState = value
      })

      await get().userActions.setUserDetails()
    },
    logout: () =>
      set((state) => {
        state.authState = initialAuthState
      })
  }
})

export default createAuthSlice
