import { useState } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { FiGitMerge } from 'react-icons/fi'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

import Sidebar from '../../components/Sidebar'

export default function OverviewTab() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { pullId } = useParams()
  const [selectedRepo, mergePR, closePR] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.pullRequestActions.mergePullRequest,
    state.pullRequestActions.closePullRequest
  ])

  const PR = selectedRepo && selectedRepo.pullRequests[+pullId! - 1]

  async function handleMergePullRequest() {
    if (PR) {
      setIsSubmitting(true)
      const { error } = await withAsync(() => mergePR(PR.id))
      console.log({ submitted: !error })
      setIsSubmitting(false)
    }
  }

  async function handleClosePullRequest() {
    if (PR) {
      setIsSubmitting(true)
      const { error } = await withAsync(() => closePR(PR.id))
      console.log({ submitted: !error })
      setIsSubmitting(false)
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
            <div>
              {isSubmitting && (
                <Button
                  variant="solid"
                  className="flex items-center !px-4 gap-1 rounded-full cursor-not-allowed"
                  disabled
                >
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </Button>
              )}
              {!isSubmitting && (
                <Button
                  onClick={handleMergePullRequest}
                  disabled={isSubmitting}
                  className="rounded-full !bg-[#37A457] flex gap-1 items-center"
                  variant="solid"
                >
                  <FiGitMerge className="w-4 h-4" />
                  Merge
                </Button>
              )}
            </div>

            <div>
              {isSubmitting && (
                <Button
                  variant="solid"
                  className="flex items-center !px-4 gap-1 rounded-full cursor-not-allowed bg-red-600"
                  disabled
                >
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </Button>
              )}
              {!isSubmitting && (
                <Button
                  onClick={handleClosePullRequest}
                  className="rounded-full bg-red-600 flex gap-1 items-center"
                  variant="solid"
                >
                  <AiFillCloseCircle className="w-4 h-4" />
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      <Sidebar />
    </div>
  )
}
