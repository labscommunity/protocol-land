import React from 'react'

import { Button } from '@/components/common/buttons'
import NewRepoModal from '@/pages/home/components/NewRepoModal'
import { useGlobalStore } from '@/stores/globalStore'

export default function RepositoriesTab() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedOrg] = useGlobalStore((state) => [state.organizationState.selectedOrganization])
  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
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
            className="lucide lucide-search absolute left-2 top-2.5 h-4 w-4 text-gray-500"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-500 focus-visible:outline-none outline-none disabled:cursor-not-allowed disabled:opacity-50 pl-8"
            placeholder="Find a repository"
          />
        </div>
        <Button variant="primary-solid" className="h-10 text-sm rounded-md" onClick={() => setIsOpen(true)}>
          New Repository
        </Button>
      </div>
      {selectedOrg.repositories.length === 0 && (
        <div className="rounded-lg min-h-[200px] border bg-card text-card-foreground shadow-sm flex items-center justify-center">
          <p className="text-lg text-gray-500">No repositories yet</p>
        </div>
      )}
      {selectedOrg.repositories.length > 0 && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
          <div className="p-0">
            <ul>
              {selectedOrg.repositories.map((repo) => (
                <li className="p-4 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <a target="_blank" href={`/#/repository/${repo.id}`} className="font-semibold hover:underline">
                        {repo.name}
                      </a>
                      <p className="text-sm text-gray-500 mt-1">{repo.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
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
                        {Object.keys(repo.forks).length}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <NewRepoModal isOpen={isOpen} setIsOpen={setIsOpen} creator="ORGANIZATION" />
    </div>
  )
}
