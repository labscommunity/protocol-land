import React from 'react'
import { VscIssues } from 'react-icons/vsc'

import { useGlobalStore } from '@/stores/globalStore'
import { Issue } from '@/types/repository'

import IssueRow from './IssueRow'
import TableHeader from './TableHeader'

export default function IssuesTab() {
  const [view, setView] = React.useState<'OPEN' | 'CLOSED'>('OPEN')
  const [openIssuesList, setOpenIssuesList] = React.useState<Issue[]>([])
  const [closedIssuesList, setClosedIssuesList] = React.useState<Issue[]>([])
  const [repo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])

  React.useEffect(() => {
    if (repo) {
      const openIssues: Issue[] = []
      const closedIssues: Issue[] = []

      repo.issues.forEach((issue) => {
        if (issue.status === 'OPEN') {
          openIssues.push(issue)
        } else {
          closedIssues.push(issue)
        }
      })

      setOpenIssuesList(openIssues)
      setClosedIssuesList(closedIssues)
    }
  }, [repo])

  const hasIssues = openIssuesList.length > 0 || closedIssuesList.length > 0
  return (
    <div className="w-full pb-6 flex gap-8">
      <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg overflow-hidden bg-white">
        <TableHeader
          openCount={openIssuesList.length}
          closedCount={closedIssuesList.length}
          view={view}
          setView={setView}
        />
        <div className="rounded-b-lg w-full bg-white text-gray-900 overflow-hidden">
          {!hasIssues && <EmptyStateMessage message="Get started by creating a new issue." />}
          {hasIssues && view === 'OPEN' && openIssuesList.length === 0 && (
            <EmptyStateMessage message="There aren’t any open issues." />
          )}
          {hasIssues && view === 'CLOSED' && closedIssuesList.length === 0 && (
            <EmptyStateMessage message="There aren’t any closed issues." />
          )}
          {(view === 'OPEN' ? openIssuesList : closedIssuesList).map((issue) => (
            <IssueRow
              id={issue.id}
              author={issue.author}
              title={issue.title}
              status={issue.status}
              timestamp={issue.timestamp}
              completedTimestamp={issue.completedTimestamp}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const EmptyStateMessage = ({ message }: { message: string }) => (
  <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
    <VscIssues className="h-7 w-7" />
    <h1 className="text-lg font-medium">{message}</h1>
  </div>
)
