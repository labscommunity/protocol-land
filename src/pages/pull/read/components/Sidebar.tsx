import { useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { PiDotDuotone } from 'react-icons/pi'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

import ReviewerAdd from './ReviewerAdd'

export default function Sidebar() {
  const [isApproving, setIsApproving] = useState(false)
  const { pullId } = useParams()
  const [repo, address, approvePR] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.authState.address,
    state.pullRequestActions.approvePR
  ])

  const PR = repo && repo.pullRequests[+pullId! - 1]
  const isReviewer = PR?.reviewers.find((reviewer) => reviewer.address === address!)

  async function handlePRApproval() {
    setIsApproving(true)
    await approvePR(+pullId!)
    setIsApproving(false)
  }

  return (
    <div className="flex flex-col w-[20%]">
      <div className="flex flex-col gap-4 ">
        {isReviewer && !isReviewer.approved && (
          <Button
            onClick={handlePRApproval}
            isLoading={isApproving}
            disabled={isApproving}
            variant="solid"
            className="rounded-full items-center flex justify-center gap-2"
          >
            Approve
          </Button>
        )}
        <div className="flex justify-between items-center border-b-[1px] border-[#cbc9f6] pb-1 text-liberty-dark-100">
          <h1 className="text-lg font-medium">Reviewers</h1>
          <ReviewerAdd />
        </div>
        {PR && PR.reviewers.length === 0 && (
          <div>
            <p className="text-liberty-dark-100">No reviews yet</p>
          </div>
        )}
        {PR &&
          PR.reviewers.map((reviewer) => (
            <div className="flex items-center gap-1 text-liberty-dark-100">
              {reviewer.approved ? (
                <FiCheck className="min-w-[16px] h-4 !text-green-600" />
              ) : (
                <PiDotDuotone className="min-w-[24px] h-6 !text-yellow-500" />
              )}
              <span className="truncate">{reviewer.address}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
