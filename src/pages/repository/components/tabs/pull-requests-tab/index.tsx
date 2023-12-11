import { useEffect, useState } from 'react'
import { FiGitPullRequest } from 'react-icons/fi'

import { useGlobalStore } from '@/stores/globalStore'
import { PullRequest } from '@/types/repository'

import PullRequestRow from './PullRequestRow'
import TableHeader from './TableHeader'

export default function PullRequestsTab() {
  const [view, setView] = useState<'OPEN' | 'CLOSED'>('OPEN')
  const [openPRList, setOpenPRList] = useState<PullRequest[]>([])
  const [closedPRList, setClosedPRList] = useState<PullRequest[]>([])
  const [repo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])

  useEffect(() => {
    if (repo) {
      const openPRs: PullRequest[] = []
      const closedPRs: PullRequest[] = []

      repo.pullRequests.forEach((PR) => {
        if (PR.status === 'OPEN') {
          openPRs.push(PR)
        } else {
          closedPRs.push(PR)
        }
      })

      setOpenPRList(openPRs)
      setClosedPRList(closedPRs)
    }
  }, [repo])

  const hasPRs = openPRList.length > 0 || closedPRList.length > 0

  return (
    <div className="w-full pb-6 flex gap-8">
      <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg bg-white overflow-hidden">
        <TableHeader openCount={openPRList.length} closedCount={closedPRList.length} view={view} setView={setView} />
        <div className="rounded-b-lg w-full bg-white text-liberty-dark-100 overflow-hidden">
          {!hasPRs && <EmptyStateMessage message="Get started by creating a new pull request." />}
          {hasPRs && view === 'OPEN' && openPRList.length === 0 && (
            <EmptyStateMessage message="There aren’t any open pull requests." />
          )}
          {hasPRs && view === 'CLOSED' && closedPRList.length === 0 && (
            <EmptyStateMessage message="There aren’t any closed pull requests." />
          )}
          {(view === 'OPEN' ? openPRList : closedPRList).map((pr) => (
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

const EmptyStateMessage = ({ message }: { message: string }) => (
  <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
    <FiGitPullRequest className="h-7 w-7" />
    <h1 className="text-lg font-medium">{message}</h1>
  </div>
)
