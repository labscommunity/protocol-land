import React from 'react'
import { VscIssues } from 'react-icons/vsc'

import { useGlobalStore } from '@/stores/globalStore'
import { Issue } from '@/types/repository'

import IssueRow from './IssueRow'
import TableHeader from './TableHeader'

export default function IssuesTab() {
  const [view, setView] = React.useState<'OPEN' | 'CLOSED'>('OPEN')
  const [issuesList, setIssuesList] = React.useState<Issue[]>([])
  const [repo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])

  React.useEffect(() => {
    if (repo) {
      let filteredIssues: Issue[] = []

      if (view === 'OPEN') {
        filteredIssues = repo.issues.filter((issue) => issue.status === 'OPEN')
      }

      if (view === 'CLOSED') {
        filteredIssues = repo.issues.filter((issue) => issue.status === 'CLOSED' || issue.status === 'COMPLETED')
      }

      setIssuesList(filteredIssues)
    }
  }, [repo, view])

  const hasPRs = issuesList.length > 0
  return (
    <div className="w-full pb-6 flex gap-8">
      <div className="flex flex-col w-full">
        <TableHeader view={view} setView={setView} />
        <div className="rounded-b-lg w-full bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          {!hasPRs && (
            <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
              <VscIssues className="h-7 w-7" />
              <h1 className="text-lg font-medium">Get started by creating a new issue</h1>
            </div>
          )}
          {issuesList.map((issue) => (
            <IssueRow
              id={issue.id}
              author={issue.author}
              title={issue.title}
              status={issue.status}
              timestamp={issue.timestamp}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
