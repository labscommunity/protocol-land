import { useEffect, useState } from 'react'
import { FiGitPullRequest } from 'react-icons/fi'

import { useGlobalStore } from '@/stores/globalStore'
import { PullRequest } from '@/types/repository'

import PullRequestRow from './PullRequestRow'
import TableHeader from './TableHeader'

export default function PullRequestsTab() {
  const [view, setView] = useState<'OPEN' | 'CLOSED'>('OPEN')
  const [PRList, setPRList] = useState<PullRequest[]>([])
  const [repo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])

  useEffect(() => {
    if (repo) {
      let filteredPRs: PullRequest[] = []

      if (view === 'OPEN') {
        filteredPRs = repo.pullRequests.filter((pr) => pr.status === 'OPEN')
      }

      if (view === 'CLOSED') {
        filteredPRs = repo.pullRequests.filter((pr) => pr.status === 'CLOSED' || pr.status === 'MERGED')
      }

      setPRList(filteredPRs)
    }
  }, [repo, view])

  const hasPRs = PRList.length > 0

  return (
    <div className="w-full pb-6 flex gap-8">
      <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg bg-white overflow-hidden">
        <TableHeader view={view} setView={setView} />
        <div className="rounded-b-lg w-full bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          {!hasPRs && (
            <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
              <FiGitPullRequest className="h-7 w-7" />
              <h1 className="text-lg font-medium">Get started by creating a new pull request</h1>
            </div>
          )}
          {PRList.map((pr) => (
            <PullRequestRow
              id={pr.id}
              author={pr.author}
              title={pr.title}
              status={pr.status}
              timestamp={pr.timestamp}
            />
          ))}
          {/* <PullRequestRow status="OPEN" />
          <PullRequestRow status="CLOSED" />
          <PullRequestRow status="MERGED" /> */}
        </div>
      </div>
    </div>
  )
}
