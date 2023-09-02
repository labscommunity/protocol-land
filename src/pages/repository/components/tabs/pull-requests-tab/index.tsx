import { FiGitPullRequest } from 'react-icons/fi'

import { useGlobalStore } from '@/stores/globalStore'

import PullRequestRow from './PullRequestRow'
import TableHeader from './TableHeader'

export default function PullRequestsTab() {
  const [repo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])

  const hasPRs = repo ? repo.pullRequests.length > 0 : false

  return (
    <div className="w-full pb-6 flex gap-8">
      <div className="flex flex-col w-full">
        <TableHeader />
        <div className="rounded-b-lg w-full bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          {!hasPRs && (
            <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
              <FiGitPullRequest className="h-7 w-7" />
              <h1 className="text-lg font-medium">Get started by creating a new pull request</h1>
            </div>
          )}
          {repo &&
            repo.pullRequests.map((pr) => (
              <PullRequestRow id={pr.id} author={pr.author} title={pr.title} status={pr.status} />
            ))}
          {/* <PullRequestRow status="OPEN" />
          <PullRequestRow status="CLOSED" />
          <PullRequestRow status="MERGED" /> */}
        </div>
      </div>
    </div>
  )
}
