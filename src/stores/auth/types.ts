export interface AuthSlice {
  authState: AuthState
  authActions: AuthActions
}

export type AuthState = {
  isLoggedIn: boolean
  address: string | null
  method: string | null
}

export type AuthActions = {
  login: (value: AuthState) => void
  logout: () => void
}
