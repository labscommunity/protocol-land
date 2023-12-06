import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import { AiOutlineIssuesClose } from 'react-icons/ai'
import { FaArrowLeft } from 'react-icons/fa'
import { GoIssueClosed } from 'react-icons/go'
import { VscIssues } from 'react-icons/vsc'
import { useNavigate } from 'react-router-dom'
import Sticky from 'react-stickynode'

import { Button } from '@/components/common/buttons'
import IssueTitle from '@/components/IssuePr/Title'
import { shortenAddress } from '@/helpers/shortenAddress'
import { Issue, IssueStatus } from '@/types/repository'

import ActionButton from './ActionButton'

const statusMap = {
  OPEN: ({ status }: { status: IssueStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-[#38a457] text-white px-4 py-2 rounded-full font-medium">
      <VscIssues className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  ),
  CLOSED: ({ status }: { status: IssueStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-red-700 text-white px-4 py-2 rounded-full font-medium">
      <AiOutlineIssuesClose className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  ),
  COMPLETED: ({ status }: { status: IssueStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-purple-700 text-white px-4 py-2 rounded-full font-medium">
      <GoIssueClosed className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  )
}

export default function IssueHeader({ issue }: { issue: Issue }) {
  const navigate = useNavigate()
  const [isSticky, setIsSticky] = React.useState(false)

  const StatusComponent = statusMap[issue.status]

  function goBack() {
    navigate(`/repository/${issue.repoId}/issues`)
  }

  const handleStateChange = (status: Sticky.Status) => {
    setIsSticky(status.status === Sticky.STATUS_FIXED)
  }

  return (
    <Sticky top={0} className="z-10" onStateChange={handleStateChange}>
      <div
        className={clsx(
          'flex justify-between gap-2 border-b-[1px] pb-4 bg-gray-50',
          isSticky ? 'pt-4 border-gray-300' : 'border-gray-200'
        )}
      >
        <div className="flex flex-col gap-2 w-full">
          {!isSticky && (
            <>
              <div>
                <Button onClick={goBack} variant="primary-solid">
                  <FaArrowLeft className="h-4 w-4 text-white" />
                </Button>
              </div>
              <IssueTitle issueOrPr={issue} />
            </>
          )}

          <div className="flex items-center gap-4">
            {isSticky && (
              <div>
                <Button onClick={goBack} variant="primary-solid">
                  <FaArrowLeft className="h-4 w-4 text-white" />
                </Button>
              </div>
            )}
            {issue && <StatusComponent status={issue!.status} />}
            <div className="text-gray-600">
              {isSticky && <IssueTitle issueOrPr={issue} showEdit={false} />}
              {shortenAddress(issue.author)} has opened this issue{' '}
              {formatDistanceToNow(new Date(issue.timestamp), { addSuffix: true })}
            </div>
          </div>
        </div>
        {isSticky && (
          <div className="flex items-center">
            <ActionButton />
          </div>
        )}
      </div>
    </Sticky>
  )
}
