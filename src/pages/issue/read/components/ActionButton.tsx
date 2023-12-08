import React from 'react'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

export default function ActionButton({ isContributor }: { isContributor: boolean }) {
  const [isSubmittingClose, setIsSubmittingClose] = React.useState(false)
  const [selectedIssue, closeIssue, reopenIssue] = useGlobalStore((state) => [
    state.issuesState.selectedIssue,
    state.issuesActions.closeIssue,
    state.issuesActions.reopenIssue
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

  if (!selectedIssue) return null

  const isOpen = selectedIssue.status === 'OPEN'

  return (
    <div className="flex">
      {isContributor && (
        <div className="flex w-full border-gray-200 justify-center h-10">
          {isOpen ? (
            <Button
              isLoading={isSubmittingClose}
              onClick={handleCloseButtonClick}
              variant="secondary"
              className="w-28 justify-center"
            >
              Close
            </Button>
          ) : (
            <Button
              className="break-keep hyphens-auto"
              isLoading={isSubmittingClose}
              onClick={handleReopen}
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
