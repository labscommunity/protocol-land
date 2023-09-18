import React from 'react'
import { VscIssues } from 'react-icons/vsc'
import { useParams } from 'react-router-dom'

import { useGlobalStore } from '@/stores/globalStore'
import { Bounty, Issue } from '@/types/repository'

import BountyRow from './BountyRow'
import ReadBountyModal from './ReadBountyModal'
import TableHeader from './TableHeader'

export default function BountyTab() {
  const { issueId } = useParams()
  const [selectedIssue, setSelectedIssue] = React.useState<null | Issue>(null)
  const [view, setView] = React.useState<'OPEN' | 'CLOSED'>('OPEN')
  const [bountiesList, setBountiesList] = React.useState<Bounty[]>([])
  const [repo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])
  const [isViewBountyOpen, setViewBountyOpen] = React.useState(false)
  const [selectedBounty, setSelectedBounty] = React.useState<null | Bounty>(null)

  React.useEffect(() => {
    if (repo) {
      const issue = repo.issues.find((issue) => issue.id === +issueId!)

      if (issue) {
        setSelectedIssue(issue)
      }
    }
  }, [repo])

  React.useEffect(() => {
    if (selectedIssue && repo) {
      let filteredBounties: Bounty[] = []

      if (view === 'OPEN') {
        filteredBounties = selectedIssue?.bounties?.filter((bounty) => bounty.status === 'ACTIVE')
      }

      if (view === 'CLOSED') {
        filteredBounties = selectedIssue?.bounties?.filter((bounty) =>
          ['EXPIRED', 'CLOSED', 'CLAIMED'].includes(bounty.status)
        )
      }

      setBountiesList(filteredBounties || [])
    }
  }, [selectedIssue, view])

  function handleRowClick(bounty: Bounty) {
    setSelectedBounty(bounty)
    setViewBountyOpen(true)
  }

  const hasBounties = bountiesList.length > 0

  return (
    <div className="w-full pb-6 flex gap-8">
      <div className="flex flex-col w-full">
        <TableHeader view={view} setView={setView} />
        <div className="rounded-b-lg w-full bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          {!hasBounties && (
            <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
              <VscIssues className="h-7 w-7" />
              <h1 className="text-lg font-medium">Get started by adding a new bounty</h1>
            </div>
          )}
          {bountiesList.map((bounty) => (
            <BountyRow
              id={bounty.id}
              author={selectedIssue?.author || ''}
              amount={bounty.amount}
              status={bounty.status}
              timestamp={bounty.timestamp}
              expiry={bounty.expiry}
              onClick={() => handleRowClick(bounty)}
            />
          ))}
        </div>
      </div>
      {selectedBounty && (
        <ReadBountyModal
          author={selectedIssue?.author || ''}
          bounty={selectedBounty}
          isOpen={isViewBountyOpen}
          setIsOpen={setViewBountyOpen}
        />
      )}
    </div>
  )
}
