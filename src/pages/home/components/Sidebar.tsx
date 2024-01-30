import { useConnection } from '@arweave-wallet-kit-beta/react'
import clsx from 'clsx'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { RiGitRepositoryFill } from 'react-icons/ri'
import { Link } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo } from '@/types/repository'

interface SidebarProps {
  repos: Repo[]
  isLoading: boolean
  setIsRepoModalOpen: Dispatch<SetStateAction<boolean>>
}

export default function Sidebar({ repos, isLoading, setIsRepoModalOpen }: SidebarProps) {
  const [isLoggedIn] = useGlobalStore((state) => [state.authState.isLoggedIn])
  const [searchTerm, setSearchTerm] = useState('')
  const hasRepos = repos.length > 0
  const { connect } = useConnection()
  const filteredRepos = useMemo(() => {
    if (searchTerm && hasRepos) {
      return repos.filter((repo) => `${resolveUsernameOrShorten(repo.owner)}/${repo.name}`.includes(searchTerm))
    }
    return repos
  }, [searchTerm, hasRepos])

  async function handleNewRepoBtnClick() {
    if (!isLoggedIn) {
      connect()
    } else {
      setIsRepoModalOpen(true)
    }

    trackGoogleAnalyticsEvent('Repository', 'Create Repository button click', 'Create new repo')
  }

  return (
    <div className="overflow-y-auto max-h-screen sticky top-0 w-[20%] py-8 px-6 border-r-[1px] border-gray-200 flex flex-col gap-2">
      <div className="flex w-full justify-between">
        <h1 className="text-xl font-medium text-center text-gray-900">Repositories</h1>
        <Button className="!py-0 !px-2" variant="primary-outline" onClick={handleNewRepoBtnClick}>
          <FaPlus className="xl:mr-1 w-[14px] h-[14px]" /> <span className="hidden xl:block">New</span>
        </Button>
      </div>

      {isLoggedIn && hasRepos && (
        <div className="mt-1">
          <input
            type="text"
            className={clsx(
              'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-2 outline-none border-gray-300'
            )}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Find a repository..."
          />
        </div>
      )}

      {!isLoggedIn && (
        <div className="w-full text-center py-4">
          <h3 className="text-gray-900">Login to view your repositories</h3>
        </div>
      )}
      {isLoggedIn && !hasRepos && !isLoading && (
        <div className="w-full text-center py-4">
          <h3 className="text-gray-900">No repositories found</h3>
        </div>
      )}
      {isLoading && (
        <div className="w-full text-left py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="h-2 bg-gray-500 rounded-full w-[80%] animate-pulse"></div>
            <div className="h-2 bg-gray-500 rounded-full w-[80%] animate-pulse"></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-2 bg-gray-500 rounded-full w-[80%] animate-pulse"></div>
            <div className="h-2 bg-gray-500 rounded-full w-[80%] animate-pulse"></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-2 bg-gray-500 rounded-full w-[80%] animate-pulse"></div>
            <div className="h-2 bg-gray-500 rounded-full w-[80%] animate-pulse"></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-2 bg-gray-500 rounded-full w-[80%] animate-pulse"></div>
            <div className="h-2 bg-gray-500 rounded-full w-[80%] animate-pulse"></div>
          </div>
        </div>
      )}

      {isLoggedIn && hasRepos && (
        <div className="w-full text-left pt-1 pb-4">
          {filteredRepos.map((repo) =>
            repo.id ? (
              <Link to={`/repository/${repo.id}`}>
                <Button
                  className="text-gray-900 group !pb-2 text-[16.5px] 2xl:text-[18px] text-left flex gap-2 items-center w-full hover:bg-primary-600 hover:rounded-md !px-2 hover:text-white"
                  variant="link"
                >
                  <div>
                    <RiGitRepositoryFill className="w-5 h-5 text-inherit" />
                  </div>
                  <div className="break-words overflow-auto">
                    {resolveUsernameOrShorten(repo.owner)}
                    <span className="text-gray-600 group-hover:text-white">/</span>
                    {repo.name}
                  </div>
                </Button>
              </Link>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
