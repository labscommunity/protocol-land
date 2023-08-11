import React from 'react'

import Navbar from '@/components/Navbar'

export default function AppLayout({ children }: { children: React.JSX.Element }) {
  return (
    <div className="flex flex-col h-screen bg-[linear-gradient(155deg,#202020_20%,#000_180%)]">
      <Navbar />
      {children}
    </div>
  )
}
