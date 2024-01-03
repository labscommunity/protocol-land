import { StateCreator } from 'zustand'

import { CHECK_WHITELIST_URL, WHITELIST_API_KEY } from '@/helpers/constants'

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
      const whitelistResponse = await fetch(`${CHECK_WHITELIST_URL}${value.address}`, {
        headers: {
          apikey: WHITELIST_API_KEY
        }
      })
      const whiteListedUser = await whitelistResponse.json()

      if (whiteListedUser && whiteListedUser.length > 0 && whiteListedUser[0].address === value.address) {
        set((state) => {
          state.authState = value
        })

        await get().userActions.setUserDetails()

        return true
      }
    },
    logout: () =>
      set((state) => {
        state.authState = initialAuthState
      })
  }
})

export default createAuthSlice
