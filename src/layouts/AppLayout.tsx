import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import Navbar from '@/components/Navbar'
import { useGlobalStore } from '@/stores/globalStore'

export default function AppLayout({ Component }: { Component: () => JSX.Element }) {
  const location = useLocation()
  const [authState, allUsers, updateAllUsers] = useGlobalStore((state) => [
    state.authState,
    state.userState.allUsers,
    state.userActions.updateAllUsers
  ])
  const strategy = React.useMemo(() => localStorage.getItem('wallet_kit_strategy_id'), [authState.isLoggedIn])

  useEffect(() => {
    if (allUsers.size === 0) {
      updateAllUsers()
    }
  }, [allUsers.size])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {((location.pathname === '/' && strategy) || location.pathname !== '/') && <Navbar />}
      <Component />
    </div>
  )
}
