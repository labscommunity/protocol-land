import { RiGitRepositoryFill } from 'react-icons/ri'
import { Link } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo } from '@/types/repository'

export default function Sidebar({ repos, isLoading }: { repos: Repo[]; isLoading: boolean }) {
  const [isLoggedIn] = useGlobalStore((state) => [state.auth.isLoggedIn])
  const hasRepos = repos.length > 0

  return (
    <div className="w-[20%] py-8 px-6 border-r-[1px] border-[#cbc9f6] flex flex-col gap-2">
      <h1 className="text-xl font-medium text-center text-liberty-dark-100">Repositories</h1>

      {!isLoggedIn && (
        <div className="w-full text-center py-4">
          <h3 className="text-liberty-dark-100">Login to view your repositories</h3>
        </div>
      )}
      {isLoggedIn && !hasRepos && !isLoading && (
        <div className="w-full text-center py-4">
          <h3 className="text-liberty-dark-100">No repositories found</h3>
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
        <div className="w-full text-left py-4">
          {repos.map((repo) => (
            <Link to={`/repository/${repo.id}`}>
              <Button
                className="text-liberty-dark-100 !pb-2 text-[18px] flex gap-2 items-center w-full hover:bg-[#4487F5] hover:rounded-md !px-2 hover:text-white"
                variant="link"
              >
                <RiGitRepositoryFill className="w-5 h-5 text-inherit" />
                {repo.name}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
