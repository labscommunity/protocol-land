import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const withMiddlewares = <T>(f: StateCreator<T, [['zustand/immer', never]], []>) => devtools(immer<T>(f))

type AuthState = {
  isLoggedIn: boolean
  address: string | null
  method: string | null
}

type AppState = {
  auth: AuthState
}

type Actions = {
  login: (value: AuthState) => void
  logout: () => void
}

const initialAuthState = {
  isLoggedIn: false,
  address: null,
  method: null
}

export const useGlobalStore = create(
  withMiddlewares<AppState & Actions>((set) => ({
    auth: initialAuthState,
    login: (value: AuthState) =>
      set((state) => {
        state.auth = value
      }),
    logout: () =>
      set((state) => {
        state.auth = initialAuthState
      })
  }))
)
