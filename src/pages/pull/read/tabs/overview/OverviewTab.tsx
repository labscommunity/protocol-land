import MDEditor from '@uiw/react-md-editor'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { AiFillCloseCircle } from 'react-icons/ai'
import { FiGitMerge } from 'react-icons/fi'
import { VscGitMerge, VscGitPullRequest, VscGitPullRequestClosed } from 'react-icons/vsc'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import PrDescription from '@/components/IssuePr/Description'
import { shortenAddress } from '@/helpers/shortenAddress'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'
import { PullRequestActivityComment, PullRequestActivityStatus } from '@/types/repository'

import Sidebar from '../../components/Sidebar'

const StatusColorMap = {
  OPEN: '',
  REOPEN: 'bg-[#38a457]',
  MERGED: 'bg-purple-700',
  CLOSED: 'bg-red-700'
}

const StatusLogoMap = {
  REOPEN: <VscGitPullRequest className="h-4 w-4 text-white" />,
  MERGED: <VscGitMerge className="h-4 w-4 text-white" />,
  CLOSED: <VscGitPullRequestClosed className="h-4 w-4 text-white" />,
  OPEN: <></>
}

const StatusTextMap = {
  OPEN: '',
  CLOSED: 'closed',
  MERGED: 'merged',
  REOPEN: 'reopened'
}

export default function OverviewTab() {
  const [isSubmittingMerge, setIsSubmittingMerge] = useState(false)
  const [isSubmittingClose, setIsSubmittingClose] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentVal, setCommentVal] = useState('')
  const { pullId } = useParams()
  const [isLoggedIn, selectedRepo, mergePR, closePR, reopenPR, addComment, isContributor] = useGlobalStore((state) => [
    state.authState.isLoggedIn,
    state.repoCoreState.selectedRepo.repo,
    state.pullRequestActions.mergePullRequest,
    state.pullRequestActions.closePullRequest,
    state.pullRequestActions.reopenPullRequest,
    state.pullRequestActions.addComment,
    state.repoCoreActions.isContributor
  ])
  const navigate = useNavigate()

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

  async function handleAddComment() {
    if (PR) {
      setIsSubmittingComment(true)

      const { error } = await withAsync(() => addComment(PR.id, commentVal))

      if (error) {
        toast.error('Failed to add comment')
      } else {
        setCommentVal('')
      }

      setIsSubmittingComment(false)
    }
  }

  const formatTimestamp = (timestamp: number) => formatDistanceToNow(new Date(timestamp), { addSuffix: true })

  if (!PR) return null

  const contributor = isContributor()
  const isOpen = PR.status === 'OPEN'
  const isMerged = PR.status === 'MERGED'

  return (
    <div className="flex gap-6 pb-10">
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-8">
          <ol className="relative border-s-2 border-gray-300 ms-5">
            <li className="mb-10 -ms-5">
              <PrDescription issueOrPr={PR!} />
            </li>
            {PR.activities &&
              PR.activities.map((activity) => {
                const commentActivity = activity as PullRequestActivityComment
                if (activity.type === 'COMMENT') {
                  return (
                    <li className="mb-10 -ms-5">
                      <div className="flex flex-col border-[1px] border-gray-300 rounded-lg overflow-hidden">
                        <div className="flex justify-between bg-gray-200 border-b-[1px] border-gray-300 text-gray-900 px-4 py-2">
                          <span
                            className="hover:underline hover:text-primary-700 cursor-pointer font-medium"
                            onClick={() => navigate(`/user/${commentActivity.author}`)}
                          >
                            {shortenAddress(commentActivity.author)}
                          </span>
                          <span> {formatTimestamp(commentActivity.timestamp)}</span>
                        </div>
                        <div className="text-gray-900 p-4 bg-white">
                          <MDEditor.Markdown source={commentActivity.description} />
                        </div>
                      </div>
                    </li>
                  )
                } else {
                  const statusActivity = activity as PullRequestActivityStatus
                  return (
                    <li className="mb-10 ms-6">
                      <span className="absolute flex items-center justify-center rounded-full -start-4">
                        <div className={clsx('rounded-full p-[6px] flex', StatusColorMap[statusActivity.status])}>
                          {StatusLogoMap[statusActivity.status]}
                        </div>
                      </span>
                      <div className="flex gap-1">
                        <span
                          className="font-medium hover:underline cursor-pointer hover:text-primary-700"
                          onClick={() => navigate(`/user/${statusActivity.author}`)}
                        >
                          {shortenAddress(statusActivity.author)}
                        </span>
                        <span className="text-gray-500">
                          {StatusTextMap[statusActivity.status]} this {formatTimestamp(statusActivity.timestamp)}
                        </span>
                      </div>
                    </li>
                  )
                }
              })}
          </ol>
        </div>
        <div className="border-t-[1px] border-gray-200">
          {isLoggedIn && contributor && (
            <div className="flex flex-col pt-4">
              {isOpen && (
                <div className="mb-4 border p-4 flex justify-center items-center">
                  <Button
                    onClick={handleMergePullRequest}
                    disabled={isSubmittingMerge}
                    isLoading={isSubmittingMerge}
                    className="gap-2 justify-center font-medium"
                    variant="primary-solid"
                  >
                    <FiGitMerge className="w-4 h-4" />
                    Merge pull request
                  </Button>
                </div>
              )}
              {isOpen && (
                <div className="flex flex-col gap-2">
                  <span className="font-medium">Add a comment</span>
                  <MDEditor height={180} preview="edit" value={commentVal} onChange={(val) => setCommentVal(val!)} />
                </div>
              )}
              {isOpen && (
                <div className="flex w-full py-4 justify-center gap-4">
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

                  <Button
                    onClick={handleAddComment}
                    isLoading={isSubmittingComment}
                    disabled={commentVal.length === 0 || isSubmittingComment}
                    variant="primary-solid"
                    className="justify-center"
                  >
                    Comment
                  </Button>
                </div>
              )}
              {!isOpen && !isMerged && (
                <div className="flex w-full justify-center gap-4 py-4">
                  <Button
                    isLoading={isSubmittingClose}
                    disabled={isSubmittingClose}
                    onClick={handleReopenPullRequest}
                    variant="primary-solid"
                  >
                    Reopen
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Sidebar />
    </div>
  )
}
