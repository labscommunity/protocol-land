import { useActiveAddress, useConnection, useStrategy } from '@arweave-wallet-kit-beta/react'
import { useEffect, useRef } from 'react'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { useGlobalStore } from '@/stores/globalStore'

export default function useAuth() {
  const location = useLocation()
  const navigate = useNavigate()
  const [whitelistModalOpen, setWhitelistModalOpen] = React.useState(false)
  const [authState, login, logout] = useGlobalStore((state) => [
    state.authState,
    state.authActions.login,
    state.authActions.logout
  ])
  const { connected, connect, disconnect } = useConnection()
  const address = useActiveAddress()
  const strategy = useStrategy()

  const connectedRef = useRef(false)

  useEffect(() => {
    if (connected && address && strategy) {
      handleLogin(address, strategy)
    }
  }, [connected, address, strategy])

  async function handleLogin(address: string, strategy: string) {
    await login({
      isLoggedIn: true,
      address,
      method: strategy
    })

    connectedRef.current = true

    trackGoogleAnalyticsEvent('Auth', 'Post connect button click', 'Login', { address, strategy })
  }

  async function handleConnectBtnClick() {
    connect().then(() => {
      if (location.pathname === '/blog' || location.pathname.startsWith('/blog/')) {
        navigate('/')
      }
    })

    trackGoogleAnalyticsEvent('Auth', 'Connect button click', 'Connect Button')
  }

  async function handleLogoutBtnClick() {
    trackGoogleAnalyticsEvent('Auth', 'Logout button click', 'Logout Button')

    await disconnect()

    trackGoogleAnalyticsEvent('Auth', 'Post logout button click', 'Logout')

    logout()

    connectedRef.current = false
  }

  return {
    authState,
    connected,
    address,
    strategy,
    whitelistModalOpen,
    setWhitelistModalOpen,
    handleConnectBtnClick,
    handleLogoutBtnClick
  }
}
