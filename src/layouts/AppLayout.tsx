import React from 'react'

import Navbar from '@/components/Navbar'

export default function AppLayout({ children }: { children: React.JSX.Element }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  )
}
