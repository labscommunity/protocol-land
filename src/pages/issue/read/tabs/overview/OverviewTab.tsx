import MDEditor from '@uiw/react-md-editor'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import { GoIssueClosed } from 'react-icons/go'
import { GoPerson } from 'react-icons/go'
import { VscIssueReopened } from 'react-icons/vsc'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import Comment from '@/components/IssuePr/Comment'
import IssueDescription from '@/components/IssuePr/Description'
import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'
import { IssueActivityComment, IssueActivityStatus } from '@/types/repository'

import Sidebar from '../../components/Sidebar'

const StatusColorMap = {
  OPEN: '',
  REOPEN: 'bg-[#38a457]',
  COMPLETED: 'bg-purple-700',
  ASSIGNED: 'bg-gray-300'
}

const StatusLogoMap = {
  OPEN: () => <></>,
  REOPEN: () => <VscIssueReopened className="h-5 w-5 text-white" />,
  COMPLETED: () => <GoIssueClosed className="h-5 w-5 text-white" />,
  ASSIGNED: () => <GoPerson className="h-5 w-5 text-black" />
}

export default function OverviewTab() {
  const [isSubmittingClose, setIsSubmittingClose] = React.useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false)
  const [commentVal, setCommentVal] = React.useState('')
  const [isLoggedIn, isContributor, selectedIssue, closeIssue, reopenIssue, addComment] = useGlobalStore((state) => [
    state.authState.isLoggedIn,
    state.repoCoreActions.isContributor,
    state.issuesState.selectedIssue,
    state.issuesActions.closeIssue,
    state.issuesActions.reopenIssue,
    state.issuesActions.addComment
  ])
  const navigate = useNavigate()
  const contributor = isContributor()

  async function handleCloseButtonClick() {
    if (selectedIssue) {
      setIsSubmittingClose(true)

      await closeIssue(selectedIssue.id)

      setIsSubmittingClose(false)
    }
  }

  async function handleReopen() {
    if (selectedIssue) {
      setIsSubmittingClose(true)

      await reopenIssue(selectedIssue.id)

      setIsSubmittingClose(false)
    }
  }

  async function handleAddComment() {
    if (selectedIssue) {
      setIsSubmittingComment(true)

      await addComment(selectedIssue.id, commentVal)

      setIsSubmittingComment(false)
      setCommentVal('')
    }
  }

  function getSeperator(currentIndex: number, array: Array<string>) {
    return currentIndex < array.length - 2 ? ', ' : currentIndex === array.length - 2 ? ' and ' : ''
  }

  if (!selectedIssue) return null

  const isOpen = selectedIssue.status === 'OPEN'

  return (
    <div className="flex gap-6">
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-8">
          <ol className="relative border-s-2 border-gray-300 ms-5">
            <li className="mb-10 -ms-5">
              <IssueDescription issueOrPr={selectedIssue} />
            </li>
            {selectedIssue.activities &&
              selectedIssue.activities.map((activity, activityId) => {
                const commentActivity = activity as IssueActivityComment
                if (activity.type === 'COMMENT') {
                  return (
                    <li className="mb-10 -ms-5">
                      <Comment
                        isIssue={true}
                        issueOrPRId={selectedIssue.id}
                        commentId={activityId}
                        item={commentActivity}
                      />
                    </li>
                  )
                } else {
                  const { status, author, timestamp, assignees } = activity as IssueActivityStatus
                  const Icon = StatusLogoMap[status]
                  return (
                    <li className="mb-10 ms-6">
                      <span className="absolute flex items-center justify-center rounded-full -start-4">
                        <div className={clsx('rounded-full p-1', StatusColorMap[status])}>
                          <Icon />
                        </div>
                      </span>
                      <div className="flex gap-1">
                        <span
                          className="font-medium hover:underline cursor-pointer hover:text-primary-700"
                          onClick={() => navigate(`/user/${author}`)}
                        >
                          {shortenAddress(author)}
                        </span>
                        <span className="text-gray-500">
                          {status === 'COMPLETED' ? (
                            'closed this as completed '
                          ) : status === 'REOPEN' ? (
                            'reopened this '
                          ) : (
                            <div className="inline-block mr-1">
                              {assignees?.length === 1 && author === assignees[0] ? 'self-assigned ' : 'assigned '}
                              {assignees &&
                                ((assignees?.length === 1 && author !== assignees[0]) || assignees.length > 1) &&
                                assignees?.map((assignee, index) => (
                                  <>
                                    <a
                                      id={`assignee-${index}`}
                                      className="text-black font-medium hover:underline cursor-pointer hover:text-primary-700"
                                      href={`/#/user/${assignee}`}
                                    >
                                      {shortenAddress(assignee)}
                                    </a>
                                    {getSeperator(index, assignees!)}
                                  </>
                                ))}{' '}
                              this
                            </div>
                          )}
                          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
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
                <MDEditor height={180} preview="edit" value={commentVal} onChange={(val) => setCommentVal(val!)} />
              )}
              {isOpen && (
                <div className="flex w-full justify-center gap-4 py-4">
                  <Button
                    isLoading={isSubmittingClose}
                    disabled={isSubmittingClose}
                    onClick={handleCloseButtonClick}
                    variant="secondary"
                    className="justify-center"
                  >
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
              {!isOpen && (
                <div className="flex w-full justify-center gap-4 py-4">
                  <Button
                    isLoading={isSubmittingClose}
                    disabled={isSubmittingClose}
                    onClick={handleReopen}
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
