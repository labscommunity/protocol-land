import { FiCheck } from 'react-icons/fi'
import { PiDotDuotone } from 'react-icons/pi'
import { useParams } from 'react-router-dom'

import { useGlobalStore } from '@/stores/globalStore'

import ReviewerAdd from './ReviewerAdd'

export default function Sidebar() {
  const { pullId } = useParams()
  const [repo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])

  const PR = repo && repo.pullRequests[+pullId! - 1]

  return (
    <div className="flex flex-col w-[25%]">
      <div className="flex flex-col gap-2">
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
