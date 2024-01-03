import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { FiGitMerge, FiGitPullRequest } from 'react-icons/fi'
import { RiGitClosePullRequestLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import Sticky from 'react-stickynode'

import { Button } from '@/components/common/buttons'
import PrTitle from '@/components/IssuePr/Title'
import { shortenAddress } from '@/helpers/shortenAddress'
import { rootTabConfig } from '@/pages/repository/config/rootTabConfig'
import { useGlobalStore } from '@/stores/globalStore'
import { PullRequest, PullRequestStatus, Repo } from '@/types/repository'

import ActionButton from './ActionButton'

const statusMap = {
  OPEN: ({ status }: { status: PullRequestStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-[#38a457] text-white px-4 py-2 rounded-full font-medium">
      <FiGitPullRequest className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  ),
  CLOSED: ({ status }: { status: PullRequestStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-red-700 text-white px-4 py-2 rounded-full font-medium">
      <RiGitClosePullRequestLine className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  ),
  MERGED: ({ status }: { status: PullRequestStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-purple-700 text-white px-4 py-2 rounded-full font-medium">
      <FiGitMerge className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  )
}

export default function PullRequestHeader({
  PR,
  repo,
  compareRepoOwner
}: {
  PR: PullRequest
  repo: Repo
  compareRepoOwner: string
}) {
  const StatusComponent = statusMap[PR.status]
  const navigate = useNavigate()
  const [isSticky, setIsSticky] = useState(false)
  const isContributor = useGlobalStore((state) => state.repoCoreActions.isContributor)()
  const isMergeInSameRepo = PR.baseRepo.repoId === PR.compareRepo.repoId
  const lastActivity = PR.activities?.[(PR?.activities?.length ?? 0) - 1]

  function goBack() {
    navigate(`/repository/${PR.repoId}/pulls`)
  }

  function gotoBranch(id: string, branchName: string) {
    navigate(rootTabConfig[0].getPath(id, branchName))
  }

  function gotoUser(userAddress: string) {
    if (userAddress) {
      navigate(`/user/${userAddress}`)
    }
  }

  const handleStateChange = (status: Sticky.Status) => {
    setIsSticky(status.status === Sticky.STATUS_FIXED)
  }

  return (
    <Sticky top={0} innerActiveClass="z-10 left-0 !w-full" onStateChange={handleStateChange}>
      <div className={clsx('border-b-[1px] bg-gray-50 border-gray-200', isSticky ? 'py-2 shadow' : 'pb-4')}>
        <div className={clsx('flex justify-between gap-2 w-full', { 'max-w-[1280px] mx-auto': isSticky })}>
          <div className={clsx('flex flex-col gap-2', isSticky && isContributor ? 'w-[90%]' : 'w-full')}>
            {!isSticky && (
              <>
                <div>
                  <Button onClick={goBack} variant="primary-solid">
                    <FaArrowLeft className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <PrTitle issueOrPr={PR} />
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
              {PR && <StatusComponent status={PR!.status} />}
              <div className={clsx('text-gray-600', isSticky && 'truncate')}>
                {isSticky && <PrTitle issueOrPr={PR} showEdit={false} />}
                <span className={clsx(isSticky && 'text-sm')}>
                  <span
                    className="font-medium cursor-pointer hover:underline hover:text-primary-700"
                    onClick={() => gotoUser(PR.status === 'MERGED' ? lastActivity?.author : PR?.author)}
                  >
                    {PR.status === 'MERGED'
                      ? lastActivity?.author && shortenAddress(lastActivity?.author)
                      : PR?.author && shortenAddress(PR?.author)}
                  </span>{' '}
                  {PR.status !== 'MERGED' ? 'wants to merge' : 'merged'}{' '}
                  <span
                    className="text-primary-600 bg-primary-200 px-1 cursor-pointer"
                    onClick={() => gotoBranch(PR.compareRepo.repoId, PR?.compareBranch)}
                  >
                    {isMergeInSameRepo ? PR?.compareBranch : `${shortenAddress(compareRepoOwner)}:${PR?.compareBranch}`}
                  </span>{' '}
                  into{' '}
                  <span
                    className="text-primary-600 bg-primary-200 px-1 cursor-pointer"
                    onClick={() => gotoBranch(PR.baseRepo.repoId, PR?.baseBranch)}
                  >
                    {isMergeInSameRepo ? PR?.baseBranch : `${shortenAddress(repo.owner)}:${PR?.baseBranch}`}
                  </span>{' '}
                  {PR.status === 'MERGED' &&
                    PR.mergedTimestamp &&
                    formatDistanceToNow(new Date(PR.mergedTimestamp), { addSuffix: true })}
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
      </div>
    </Sticky>
  )
}
