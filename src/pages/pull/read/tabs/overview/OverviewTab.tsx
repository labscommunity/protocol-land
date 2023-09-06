import { useState } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { FiGitMerge } from 'react-icons/fi'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

import Sidebar from '../../components/Sidebar'

export default function OverviewTab() {
  const [isSubmittingMerge, setIsSubmittingMerge] = useState(false)
  const [isSubmittingClose, setIsSubmittingClose] = useState(false)
  const { pullId } = useParams()
  const [selectedRepo, mergePR, closePR] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.pullRequestActions.mergePullRequest,
    state.pullRequestActions.closePullRequest
  ])

  const PR = selectedRepo && selectedRepo.pullRequests[+pullId! - 1]

  async function handleMergePullRequest() {
    if (PR) {
      setIsSubmittingMerge(true)
      const { error } = await withAsync(() => mergePR(PR.id))
      console.log({ submitted: !error })
      setIsSubmittingMerge(false)
    }
  }

  async function handleClosePullRequest() {
    if (PR) {
      setIsSubmittingClose(true)
      const { error } = await withAsync(() => closePR(PR.id))
      console.log({ submitted: !error })
      setIsSubmittingClose(false)
    }
  }

  return (
    <div className="flex gap-6">
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col border-[1px] border-[#cbc9f6] rounded-lg overflow-hidden">
          <div className="flex font-medium bg-[#5E70AB] px-4 py-2 text-white">Description</div>
          <div className="text-liberty-dark-100 p-2 h-32 bg-white">{PR && PR.description}</div>
        </div>
        {PR && PR.status === 'OPEN' && (
          <div className="flex w-full py-4 justify-center gap-4">
            <Button
              onClick={handleMergePullRequest}
              disabled={isSubmittingMerge}
              isLoading={isSubmittingMerge}
              className="rounded-full !bg-[#37A457] flex gap-1 items-center"
              variant="solid"
            >
              <FiGitMerge className="w-4 h-4" />
              Merge
            </Button>

            <Button
              onClick={handleClosePullRequest}
              className="rounded-full bg-red-600 flex gap-1 items-center"
              variant="solid"
              disabled={isSubmittingClose}
              isLoading={isSubmittingClose}
            >
              <AiFillCloseCircle className="w-4 h-4" />
              Close
            </Button>
          </div>
        )}
      </div>
      <Sidebar />
    </div>
  )
}
