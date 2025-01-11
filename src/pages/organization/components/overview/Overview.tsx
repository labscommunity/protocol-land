import React from 'react'
import MarkdownView from 'react-showdown'

import { useGlobalStore } from '@/stores/globalStore'

export default function OverviewTab() {
  const [content, setContent] = React.useState('Get started by adding a readme to your organization in settings')
  const [selectedOrganization] = useGlobalStore((state) => [state.organizationState.selectedOrganization])

  React.useEffect(() => {
    if (selectedOrganization.organization?.readmeTxId) {
      fetchReadMe(selectedOrganization.organization.readmeTxId)
    }
  }, [selectedOrganization.organization?.readmeTxId])

  async function fetchReadMe(txId: string) {
    const response = await fetch(`https://arweave.net/${txId}`)
    if (!response.ok) {
      return
    }
    const data = await response.text()
    setContent(data)
  }

  return (
    <div>
      <div className="rounded-lg border shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">About</h3>
        </div>
        <div className="p-6 pt-0">
          <MarkdownView
            className="mde-preview-content w-full [&>ul]:list-disc text-sm text-gray-500"
            markdown={content}
            options={{ tables: true, emoji: true, tasklists: true }}
          />
          <div className="mt-4 space-y-2">
            {selectedOrganization.organization?.website && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-globe h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                  <path d="M2 12h20"></path>
                </svg>

                <a href="https://protocol.ai" className="hover:underline">
                  {selectedOrganization.organization?.website}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-users h-4 w-4"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>{selectedOrganization.organization?.members.length} members</span>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-lg border shadow-sm mt-4">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Popular Repositories</h3>
        </div>
        <div className="p-6 pt-0">
          <ul className="space-y-4">
            {selectedOrganization.repositories.map((repo) => (
              <li>
                <a href="/org/protocol-labs/IPFS" className="block hover:bg-[#f2f2f4] p-2 rounded-md">
                  <h3 className="font-semibold">{repo.name}</h3>
                  <p className="text-sm text-gray-500">A peer-to-peer hypermedia protocol</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="lucide lucide-star h-4 w-4"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      0
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="lucide lucide-git-fork h-4 w-4"
                      >
                        <circle cx="12" cy="18" r="3"></circle>
                        <circle cx="6" cy="6" r="3"></circle>
                        <circle cx="18" cy="6" r="3"></circle>
                        <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"></path>
                        <path d="M12 12v3"></path>
                      </svg>
                      {Object.keys(repo.forks).length || 0}
                    </span>
                  </div>
                </a>
              </li>
            ))}
            {selectedOrganization.repositories.length === 0 && (
              <li className="text-md text-gray-500">No repositories yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
