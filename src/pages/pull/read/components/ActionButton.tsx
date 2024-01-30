import { useState } from 'react'
import toast from 'react-hot-toast'
import { AiFillCloseCircle } from 'react-icons/ai'
import { FiGitMerge } from 'react-icons/fi'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

export default function ActionButton({ isContributor, isPRAuthor }: { isContributor: boolean; isPRAuthor: boolean }) {
  const [isSubmittingMerge, setIsSubmittingMerge] = useState(false)
  const [isSubmittingClose, setIsSubmittingClose] = useState(false)
  const [selectedRepo, mergePR, closePR, reopenPR] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.pullRequestActions.mergePullRequest,
    state.pullRequestActions.closePullRequest,
    state.pullRequestActions.reopenPullRequest
  ])
  const { pullId } = useParams()
  const PR = selectedRepo && selectedRepo.pullRequests[+pullId! - 1]

  async function handleMergePullRequest() {
    if (PR) {
      setIsSubmittingMerge(true)
      const { error } = await withAsync(() => mergePR(PR.id))
      console.log({ submitted: !error })
      if (error) {
        toast.error('Failed to merge Pull Request.')
      } else {
        toast.success('Pull Request successfully merged.')
      }
      setIsSubmittingMerge(false)
    }
  }

  async function handleClosePullRequest() {
    if (PR) {
      setIsSubmittingClose(true)
      const { error } = await withAsync(() => closePR(PR.id))
      console.log({ submitted: !error })
      if (error) {
        toast.error('Failed to close Pull Request.')
      } else {
        toast.success('Pull Request successfully closed.')
      }
      setIsSubmittingClose(false)
    }
  }

  async function handleReopenPullRequest() {
    if (PR) {
      setIsSubmittingClose(true)
      const { error } = await withAsync(() => reopenPR(PR.id))
      console.log({ submitted: !error })
      if (error) {
        toast.error('Failed to reopen Pull Request.')
      } else {
        toast.success('Pull Request successfully reopened.')
      }
      setIsSubmittingClose(false)
    }
  }

  if (!PR) return null

  const isOpen = PR.status === 'OPEN'
  const isMerged = PR.status === 'MERGED'

  return (
    <div className="flex">
      {(isContributor || isPRAuthor) && (
        <div className="flex w-full border-gray-200 justify-center h-10">
          {isOpen && (
            <div className="flex gap-3">
              {isContributor && (
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
              )}

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
          {!isOpen && !isMerged && (
            <Button
              isLoading={isSubmittingClose}
              disabled={isSubmittingClose}
              onClick={handleReopenPullRequest}
              variant="primary-solid"
            >
              Reopen
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
