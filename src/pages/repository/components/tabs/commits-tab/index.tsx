import React from 'react'
import { FiGitCommit } from 'react-icons/fi'

import CommitRow from '@/components/CommitRow'
import useCommit from '@/pages/repository/hooks/useCommit'
import { useGlobalStore } from '@/stores/globalStore'

export default function CommitsTab() {
  const [userRepo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])

  const { commitsList, fetchAllCommits } = useCommit()

  React.useEffect(() => {
    if (userRepo) {
      fetchAllCommits(userRepo.name)
    }
  }, [userRepo])

  return (
    <div className="h-full w-full px-2 py-2 flex flex-col">
      {commitsList.map((commit) => (
        <div className="w-full py-2 flex gap-4 relative items-center before:bg-gray-300 before:content-[''] before:absolute before:left-0 before:top-0 before:w-[2px] before:h-full before:block">
          <div className="ml-2 z-[1] relative">
            <FiGitCommit className="h-5 w-5 text-gray-400" />
          </div>
          <CommitRow commit={commit} />
        </div>
      ))}
    </div>
  )
}
