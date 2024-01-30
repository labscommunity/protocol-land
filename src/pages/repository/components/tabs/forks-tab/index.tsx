import { formatDistanceToNow } from 'date-fns'
import { FiGitBranch, FiGitCommit } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { useGlobalStore } from '@/stores/globalStore'

export default function ForksTab() {
  const [userRepo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])
  const forks = userRepo?.forks ?? {}

  if (Object.values(forks).length === 0) {
    return (
      <div className="h-full w-full px-2 flex flex-col">
        <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg bg-white overflow-hidden">
          <div className="rounded-t-lg flex justify-between bg-gray-200 border-b-[1px] border-gray-300 items-center gap-2 py-2 px-4 h-12"></div>

          <div className="rounded-b-lg w-full bg-white text-liberty-dark-100 overflow-hidden">
            <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
              <FiGitBranch className="h-7 w-7" />
              <h1 className="text-lg font-medium">Looks like this repository hasn't been forked yet.</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full px-2 py-2 flex flex-col">
      {Object.values(forks).map((fork) => (
        <div
          key={fork.id}
          className="w-full py-2 flex gap-4 relative items-center before:bg-gray-300 before:content-[''] before:absolute before:left-0 before:top-0 before:w-[2px] before:h-full before:block"
        >
          <div className="ml-2 z-[1] relative">
            <FiGitCommit className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between flex-1 border-[1px] border-gray-300 bg-gray-200 rounded-lg w-full px-4 py-2">
            <div className="flex flex-col">
              <Link
                to={`/repository/${fork.id}`}
                className="text-gray-900 font-medium cursor-pointer hover:underline hover:text-primary-700"
              >
                {fork.id}/{fork.name}
              </Link>
              <div className="inline-block text-gray-600">
                <Link
                  to={`/user/${fork.owner}`}
                  className="font-medium cursor-pointer hover:underline hover:text-primary-700"
                >
                  {resolveUsernameOrShorten(fork.owner)}
                </Link>
                <span> created a fork </span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(fork.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
