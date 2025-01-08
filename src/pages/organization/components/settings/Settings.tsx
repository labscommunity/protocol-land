import React from 'react'

import { Button } from '@/components/common/buttons'

export default function SettingsTab() {
  return (
    <div>
      <div className="mt-2 space-y-4">
        <div className="rounded-lg border bg-transparent shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Organization Settings</h3>
            <p className="text-sm text-gray-500">Manage your organization's profile and settings</p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label htmlFor="org-name" className="text-sm font-medium">
                Organization Name
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                id="org-name"
                value="Protocol Labs"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="org-description" className="text-sm font-medium">
                Description
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                id="org-description"
                value="Building the next generation of the decentralized web"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="org-website" className="text-sm font-medium">
                Website
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                id="org-website"
                value="https://protocol.ai"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Save Changes
            </button>
          </div>
        </div>
        <div className="rounded-lg border bg-transparent shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Danger Zone</h3>
            <p className="text-sm text-gray-500">Irreversible and destructive actions</p>
          </div>
          <div className="p-6 pt-0">
            <Button variant="primary-solid" className="h-10 text-sm rounded-md bg-red-500 hover:bg-red-600 active:bg-red-700">
              Delete Organization
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
