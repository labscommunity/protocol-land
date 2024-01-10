import React from 'react'
import { useLocation } from 'react-router-dom'

import Navbar from '@/components/Navbar'
import { useGlobalStore } from '@/stores/globalStore'

export default function AppLayout({ children }: { children: React.JSX.Element }) {
  const location = useLocation()
  const [authState] = useGlobalStore((state) => [state.authState])
  const strategy = React.useMemo(() => localStorage.getItem('wallet_kit_strategy_id'), [authState.isLoggedIn])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {((location.pathname === '/' && strategy) || location.pathname !== '/') && <Navbar />}
      {children}
    </div>
  )
}
