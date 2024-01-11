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
  const [repo, connectedAddress, expireBounty] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.authState.address,
    state.issuesActions.expireBounty
  ])
  const [isViewBountyOpen, setViewBountyOpen] = React.useState(false)
  const [selectedBounty, setSelectedBounty] = React.useState<null | Bounty>(null)
  const [isProcessingExpired, setIsProcessingExpired] = React.useState(false)

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
      const currentTimestamp = new Date().getTime()

      if (view === 'OPEN') {
        filteredBounties = (selectedIssue?.bounties || []).filter(
          (bounty) => bounty.expiry * 1000 > currentTimestamp && bounty.status === 'ACTIVE'
        )
      }

      if (view === 'CLOSED') {
        filteredBounties = (selectedIssue?.bounties || [])
          .map((bounty) => {
            if (isActiveBountyExpired(bounty, currentTimestamp)) {
              bounty = { ...bounty, status: 'EXPIRED' }
            }
            return bounty
          })
          .filter((bounty) => ['EXPIRED', 'CLOSED', 'CLAIMED'].includes(bounty.status))
      }

      setBountiesList(filteredBounties || [])
    }
  }, [selectedIssue, view])

  React.useEffect(() => {
    if (selectedIssue && repo && selectedIssue.author === connectedAddress) {
      checkBounties()
    }
  }, [selectedIssue?.id, repo?.id, connectedAddress])

  function isActiveBountyExpired(bounty: Bounty, currentTimestamp: number) {
    return bounty.expiry * 1000 < currentTimestamp && bounty.status === 'ACTIVE'
  }

  async function checkBounties() {
    if (selectedIssue && repo && !isProcessingExpired) {
      setIsProcessingExpired(true)
      const currentTimestamp = new Date().getTime()
      const expiredBounties = selectedIssue.bounties.filter((bounty) => isActiveBountyExpired(bounty, currentTimestamp))
      if (expiredBounties.length > 0) {
        const promises = expiredBounties.map(async (bounty) => {
          await expireBounty(+issueId!, bounty.id)
        })
        await Promise.all(promises).catch((err) => console.log(err))
      }
      setIsProcessingExpired(true)
    }
  }

  function handleRowClick(bounty: Bounty) {
    setSelectedBounty(bounty)
    setViewBountyOpen(true)
  }

  const hasBounties = bountiesList.length > 0

  return (
    <div className="w-full pb-6 flex gap-8">
      <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg overflow-hidden bg-white">
        <TableHeader view={view} setView={setView} />
        <div className="rounded-b-lg w-full bg-white text-gray-900 overflow-hidden">
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
