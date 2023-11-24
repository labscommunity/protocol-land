import { useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { PiDotDuotone } from 'react-icons/pi'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'
import { shortenAddress } from '@/helpers/shortenAddress'

import ReviewerAdd from './ReviewerAdd'

export default function Sidebar() {
  const [isApproving, setIsApproving] = useState(false)
  const { pullId } = useParams()
  const [repo, address, isLoggedIn, approvePR, isContributor] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.authState.address,
    state.authState.isLoggedIn,
    state.pullRequestActions.approvePR,
    state.repoCoreActions.isContributor
  ])

  const PR = repo && repo.pullRequests[+pullId! - 1]
  const isReviewer = PR?.reviewers.find((reviewer) => reviewer.address === address!)

  async function handlePRApproval() {
    if (!isLoggedIn) return

    setIsApproving(true)
    await approvePR(+pullId!)
    setIsApproving(false)
  }

  const contributor = isContributor()

  return (
    <div className="flex flex-col w-[20%]">
      <div className="flex flex-col gap-4 ">
        {isLoggedIn && isReviewer && !isReviewer.approved && PR?.status === 'OPEN' && (
          <Button
            onClick={handlePRApproval}
            isLoading={isApproving}
            disabled={isApproving}
            variant="primary-solid"
            className="justify-center w-full font-medium"
          >
            Approve
          </Button>
        )}
        <div className="flex justify-between items-center border-b-[1px] border-gray-200 pb-1 text-gray-900">
          <h1 className="text-lg font-medium">Reviewers</h1>
          {isLoggedIn && contributor && <ReviewerAdd />}
        </div>
        {PR && PR.reviewers.length === 0 && (
          <div>
            <p className="text-gray-900">No reviews yet</p>
          </div>
        )}
        {PR &&
          PR.reviewers.map((reviewer) => (
            <div className="flex items-center gap-1 text-gray-900">
              {reviewer.approved ? (
                <FiCheck className="min-w-[16px] h-4 !text-green-600" />
              ) : (
                <PiDotDuotone className="min-w-[24px] h-6 !text-yellow-500" />
              )}
              <span className="truncate">{shortenAddress(reviewer.address, 6)}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
