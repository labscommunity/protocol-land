import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { GoIssueClosed } from 'react-icons/go'
import { VscIssues } from 'react-icons/vsc'
import { useNavigate } from 'react-router-dom'
import Sticky from 'react-stickynode'

import { Button } from '@/components/common/buttons'
import IssueTitle from '@/components/IssuePr/Title'
import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'
import { Issue, IssueStatus } from '@/types/repository'

import ActionButton from './ActionButton'

const statusMap = {
  OPEN: ({ status }: { status: IssueStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-[#38a457] text-white px-4 py-2 rounded-full font-medium">
      <VscIssues className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  ),
  COMPLETED: () => (
    <span className="flex gap-2 items-center capitalize bg-purple-700 text-white px-4 py-2 rounded-full font-medium">
      <GoIssueClosed className="w-5 h-5" /> Closed
    </span>
  )
}

export default function IssueHeader({ issue }: { issue: Issue }) {
  const navigate = useNavigate()
  const [isSticky, setIsSticky] = React.useState(false)
  const isContributor = useGlobalStore((state) => state.repoCoreActions.isContributor)()

  const StatusComponent = statusMap[issue.status]

  function goBack() {
    navigate(`/repository/${issue.repoId}/issues`)
  }

  const handleStateChange = (status: Sticky.Status) => {
    setIsSticky(status.status === Sticky.STATUS_FIXED)
  }

  return (
    <Sticky top={0} innerActiveClass="z-10 left-0 !w-full" onStateChange={handleStateChange}>
      <div
        className={clsx(
          'flex justify-between gap-2 border-b-[1px] bg-gray-50',
          isSticky ? 'pt-2 pb-2 border-gray-300 w-screen  shadow' : 'pb-4 border-gray-200'
        )}
      >
        <div
          className={clsx(
            'flex flex-col gap-2',
            {
              'max-w-[1280px] mx-auto': isSticky
            },
            isSticky && isContributor ? 'w-[90%]' : 'w-full'
          )}
        >
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
            <div className={clsx('text-gray-600', isSticky && 'truncate')}>
              {isSticky && <IssueTitle issueOrPr={issue} showEdit={false} />}
              <span className={clsx(isSticky && 'text-sm')}>
                {shortenAddress(issue.author)} has opened this issue{' '}
                {formatDistanceToNow(new Date(issue.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        {isSticky && isContributor && (
          <div className="flex items-center">
            <ActionButton isContributor={isContributor} />
          </div>
        )}
      </div>
    </Sticky>
  )
}
