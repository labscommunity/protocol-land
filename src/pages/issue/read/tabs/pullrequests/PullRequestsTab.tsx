import { FiGitPullRequest } from 'react-icons/fi'

import PullRequestRow from '@/pages/repository/components/tabs/pull-requests-tab/PullRequestRow'
import { useGlobalStore } from '@/stores/globalStore'

export default function PullRequestsTab() {
  const [selectedRepo, selectedIssue] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.issuesState.selectedIssue
  ])

  const PRs =
    (selectedIssue?.linkedPRIds?.length ?? 0) > 0 &&
    selectedRepo?.pullRequests.filter((pr) => selectedIssue?.linkedPRIds?.includes(pr.id))

  return (
    <div className="w-full pb-6 flex gap-8">
      <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg bg-white overflow-hidden">
        <div className="rounded-b-lg w-full bg-white text-liberty-dark-100 overflow-hidden">
          {(!PRs || PRs.length === 0) && (
            <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
              <FiGitPullRequest className="h-7 w-7" />
              <h1 className="text-lg font-medium">No linked Pull Requests.</h1>
            </div>
          )}

          {PRs &&
            PRs.map((pr) => (
              <PullRequestRow
                id={pr.id}
                author={pr.author}
                title={pr.title}
                status={pr.status}
                timestamp={pr.timestamp}
                mergedTimestamp={pr.mergedTimestamp}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
