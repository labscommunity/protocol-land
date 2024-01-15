import { useState } from 'react'
import toast from 'react-hot-toast'
import { VscIssues } from 'react-icons/vsc'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import LinkIssue from '@/pages/pull/create/components/LinkIssue'
import IssueRow from '@/pages/repository/components/tabs/issues-tab/IssueRow'
import { useGlobalStore } from '@/stores/globalStore'
import { Issue } from '@/types/repository'

export default function IssueTab() {
  const [selectedIssue, setSelectedIssue] = useState<Issue>()
  const [isLinking, setIsLinking] = useState(false)
  const { pullId } = useParams()
  const [authState, selectedRepo, isContributor, linkIssueToPR] = useGlobalStore((state) => [
    state.authState,
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.isContributor,
    state.pullRequestActions.linkIssue
  ])
  const contributor = isContributor()

  const PR = selectedRepo && selectedRepo.pullRequests[+pullId! - 1]
  const linkedIssue = PR && selectedRepo?.issues.find((issue) => issue.id === PR.linkedIssueId)

  async function handleLinkIssue() {
    if (PR && selectedIssue) {
      setIsLinking(true)
      const { error } = await withAsync(() => linkIssueToPR(PR?.id, selectedIssue?.id))
      if (error) {
        toast.error('Link issue failed')
      } else {
        toast.success('Linkd issue successfully')
      }
      setIsLinking(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <LinkIssue
          disabled={!!linkedIssue}
          selected={selectedIssue}
          setSelected={setSelectedIssue}
          issues={selectedRepo?.issues ?? []}
        />
        <Button
          className={isLinking ? '' : 'w-28'}
          variant="primary-solid"
          disabled={!!linkedIssue || !contributor || PR?.author !== authState.address || isLinking || !selectedIssue}
          isLoading={isLinking}
          onClick={handleLinkIssue}
        >
          Link Issue
        </Button>
      </div>
      <div className="w-full pb-6 flex gap-8">
        <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg bg-white overflow-hidden">
          <div className="rounded-b-lg w-full bg-white text-liberty-dark-100 overflow-hidden">
            {linkedIssue ? (
              <IssueRow
                id={linkedIssue.id}
                author={linkedIssue.author}
                title={linkedIssue.title}
                status={linkedIssue.status}
                timestamp={linkedIssue.timestamp}
                completedTimestamp={linkedIssue.completedTimestamp}
              />
            ) : (
              <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
                <VscIssues className="h-7 w-7" />
                <h1 className="text-lg font-medium">No linked Issue.</h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
