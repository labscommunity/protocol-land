import MDEditor from '@uiw/react-md-editor'
import { formatDistanceToNow } from 'date-fns'
import React from 'react'

import { Button } from '@/components/common/buttons'
import IssueDescription from '@/components/IssuePr/Description'
import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'

import Sidebar from '../../components/Sidebar'

export default function OverviewTab() {
  const [isSubmittingClose, setIsSubmittingClose] = React.useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false)
  const [commentVal, setCommentVal] = React.useState('')
  const [isLoggedIn, selectedIssue, closeIssue, reopenIssue, addComment] = useGlobalStore((state) => [
    state.authState.isLoggedIn,
    state.issuesState.selectedIssue,
    state.issuesActions.closeIssue,
    state.issuesActions.reopenIssue,
    state.issuesActions.addComment
  ])

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

  if (!selectedIssue) return null

  const isOpen = selectedIssue.status === 'OPEN'

  return (
    <div className="flex gap-6">
      <div className="flex flex-col w-full gap-14">
        <div className="flex flex-col gap-8">
          <IssueDescription issueOrPr={selectedIssue} />

          {selectedIssue.comments &&
            selectedIssue.comments.map((comment) => (
              <div className="flex flex-col border-[1px] border-gray-300 rounded-lg overflow-hidden">
                <div className="flex justify-between bg-gray-200 border-b-[1px] border-gray-300 text-gray-900 px-4 py-2">
                  <span>{shortenAddress(comment.author)}</span>
                  <span> {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</span>
                </div>
                <div className="text-gray-900 p-2 h-32 bg-white">
                  <MDEditor.Markdown source={comment.description} />
                </div>
              </div>
            ))}
        </div>

        {isLoggedIn && (
          <div className="flex flex-col border-t-[1px] border-gray-200 pt-4">
            {isOpen && (
              <MDEditor height={180} preview="edit" value={commentVal} onChange={(val) => setCommentVal(val!)} />
            )}
            {isOpen && (
              <div className="flex w-full justify-center gap-4 py-4">
                <Button
                  isLoading={isSubmittingClose}
                  onClick={handleCloseButtonClick}
                  variant="secondary"
                  className="w-28 justify-center"
                >
                  Close
                </Button>
                <Button
                  onClick={handleAddComment}
                  isLoading={isSubmittingComment}
                  disabled={commentVal.length === 0 || isSubmittingComment}
                  variant="primary-solid"
                  className="w-28 justify-center"
                >
                  Comment
                </Button>
              </div>
            )}
            {!isOpen && (
              <div className="flex w-full justify-center gap-4 py-4">
                <Button isLoading={isSubmittingClose} onClick={handleReopen} variant="primary-solid">
                  Re-Open
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <Sidebar />
    </div>
  )
}
