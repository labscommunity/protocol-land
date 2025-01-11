import React from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/common/buttons'
import { Organization } from '@/types/orgs'

export default function Header({ organization }: { organization: Organization }) {
  function handleFollowButtonClick() {
    toast.success('Coming soon')
  }
  return (
    <header className="border-b border-gray-300">
      <div className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="relative flex shrink-0 overflow-hidden rounded-full h-20 w-20">
            {organization.logo && (
              <img className="aspect-square h-full w-full" alt={organization.name} src={organization.logo} />
            )}
            {!organization.logo && (
              <div className="aspect-square h-full w-full bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 font-bold text-2xl">{organization.name.charAt(0)}</span>
              </div>
            )}
          </span>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {organization.name}
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-gray-200 text-gray-800">
                Public
              </div>
            </h1>
            {!organization.description && <p className="text-[#71717a] italic">No description</p>}
            {organization.description && <p className="text-[#71717a]">{organization.description}</p>}
          </div>
        </div>
        <div className="h-full flex items-center">
          <Button variant="primary-solid" className="rounded-md h-10 text-sm" onClick={handleFollowButtonClick}>
            <span>Follow</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
