import React from 'react'

import { Button } from '@/components/common/buttons'

export default function Header() {
  return (
    <header className="border-b border-gray-300">
      <div className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="relative flex shrink-0 overflow-hidden rounded-full h-20 w-20">
            <img className="aspect-square h-full w-full" alt="Protocol Labs" src="https://placehold.co/400" />
          </span>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Protocol Labs
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-gray-200 text-gray-800">
                Public
              </div>
            </h1>
            <p className="text-[#71717a]">Building the next generation of the decentralized web</p>
          </div>
        </div>
        <div className="h-full flex items-center">
          <Button variant="primary-solid" className="rounded-md h-10 text-sm">
            <span>Follow</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
