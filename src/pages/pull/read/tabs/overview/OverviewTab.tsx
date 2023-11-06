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
  const [isLoggedIn, selectedRepo, mergePR, closePR, isContributor] = useGlobalStore((state) => [
    state.authState.isLoggedIn,
    state.repoCoreState.selectedRepo.repo,
    state.pullRequestActions.mergePullRequest,
    state.pullRequestActions.closePullRequest,
    state.repoCoreActions.isContributor
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

  const contributor = isContributor()

  return (
    <div className="flex gap-6">
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col border-gray-300 border-[1px] w-full rounded-lg bg-white overflow-hidden">
          <div className="flex justify-between bg-gray-200 border-b-[1px] border-gray-300 text-gray-900 font-medium px-4 py-2">
            Description
          </div>
          <div className="text-gray-900 p-2 h-32 bg-white">{PR && PR.description}</div>
        </div>
        {isLoggedIn && contributor && PR && PR.status === 'OPEN' && (
          <div className="flex w-full py-4 justify-center gap-4">
            <Button
              onClick={handleMergePullRequest}
              disabled={isSubmittingMerge}
              isLoading={isSubmittingMerge}
              className="gap-2 justify-center font-medium"
              variant="primary-solid"
            >
              <FiGitMerge className="w-4 h-4" />
              Merge
            </Button>

            <Button
              onClick={handleClosePullRequest}
              className="gap-2 justify-center font-medium"
              variant="secondary"
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
