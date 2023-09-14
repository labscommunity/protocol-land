import MDEditor from '@uiw/react-md-editor'
import { formatDistanceToNow } from 'date-fns'
import React from 'react'

import { Button } from '@/components/common/buttons'
import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'

import Sidebar from '../../components/Sidebar'

export default function OverviewTab() {
  const [isSubmittingClose, setIsSubmittingClose] = React.useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false)
  const [commentVal, setCommentVal] = React.useState('')
  const [selectedIssue, closeIssue, reopenIssue, addComment] = useGlobalStore((state) => [
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

  console.log({ selectedIssue })

  return (
    <div className="flex gap-6">
      <div className="flex flex-col w-full gap-14">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col border-[1px] border-[#cbc9f6] rounded-lg overflow-hidden">
            <div className="flex justify-between bg-[#5E70AB] px-4 py-2 text-white">
              <span>{shortenAddress(selectedIssue.author)}</span>
              <span> {formatDistanceToNow(new Date(selectedIssue.timestamp), { addSuffix: true })}</span>
            </div>
            <div className="text-liberty-dark-100 p-2 bg-white overflow-auto max-h-[50vh] h-full">
              <MDEditor.Markdown source={selectedIssue.description} />
            </div>
          </div>
          {selectedIssue.comments &&
            selectedIssue.comments.map((comment) => (
              <div className="flex flex-col border-[1px] border-[#cbc9f6] rounded-lg overflow-hidden">
                <div className="flex justify-between bg-[#5E70AB] px-4 py-2 text-white">
                  <span>{shortenAddress(comment.author)}</span>
                  <span> {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</span>
                </div>
                <div className="text-liberty-dark-100 p-2 h-32 bg-white">
                  <MDEditor.Markdown source={comment.description} />
                </div>
              </div>
            ))}
        </div>

        <div className="flex flex-col border-t-[1px] border-[#cbc9f6] pt-4">
          {isOpen && (
            <MDEditor height={180} preview="edit" value={commentVal} onChange={(val) => setCommentVal(val!)} />
          )}
          {isOpen && (
            <div className="flex w-full justify-center gap-4 py-4">
              <Button
                isLoading={isSubmittingClose}
                onClick={handleCloseButtonClick}
                className="rounded-full bg-purple-600 flex items-center"
                variant="solid"
              >
                Close
              </Button>
              <Button
                onClick={handleAddComment}
                isLoading={isSubmittingComment}
                disabled={commentVal.length === 0 || isSubmittingComment}
                className="rounded-full !bg-[#38a457] disabled:cursor-not-allowed disabled:!bg-[#9dd5ad] flex items-center"
                variant="solid"
              >
                Comment
              </Button>
            </div>
          )}
          {!isOpen && (
            <div className="flex w-full justify-center gap-4 py-4">
              <Button
                isLoading={isSubmittingClose}
                onClick={handleReopen}
                className="rounded-full !bg-[#38a457] flex items-center"
                variant="solid"
              >
                Re-Open
              </Button>
            </div>
          )}
        </div>
      </div>
      <Sidebar />
    </div>
  )
}
