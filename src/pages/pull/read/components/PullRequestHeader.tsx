import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { FiGitMerge, FiGitPullRequest } from 'react-icons/fi'
import { RiGitClosePullRequestLine } from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'
import Sticky from 'react-stickynode'

import { Button } from '@/components/common/buttons'
import PrTitle from '@/components/IssuePr/Title'
import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
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
  const [isContributor, connectedAddress, isMergable] = useGlobalStore((state) => [
    state.repoCoreActions.isContributor,
    state.authState.address,
    state.pullRequestState.isMergeable
  ])
  const isMergeInSameRepo = PR.baseRepo.repoId === PR.compareRepo.repoId
  const lastActivity = PR.activities?.[(PR?.activities?.length ?? 0) - 1]
  const contributor = isContributor()
  const contributorOrPRAuthor = contributor || connectedAddress === PR.author

  function goBack() {
    navigate(`/repository/${PR.repoId}/pulls`)
  }

  const handleStateChange = (status: Sticky.Status) => {
    setIsSticky(status.status === Sticky.STATUS_FIXED)
  }

  return (
    <Sticky top={0} innerActiveClass="z-10 left-0 !w-full" onStateChange={handleStateChange}>
      <div className={clsx('border-b-[1px] bg-gray-50 border-gray-200', isSticky ? 'py-2 shadow' : 'pb-4')}>
        <div className={clsx('flex justify-between gap-2 w-full', { 'max-w-[1280px] mx-auto': isSticky })}>
          <div className={clsx('flex flex-col gap-2', isSticky && contributorOrPRAuthor ? 'w-[90%]' : 'w-full')}>
            {!isSticky && (
              <>
                <div>
                  <Button onClick={goBack} variant="primary-solid">
                    <FaArrowLeft className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <PrTitle issueOrPr={PR} canEdit={contributorOrPRAuthor} />
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
                {isSticky && <PrTitle issueOrPr={PR} isSticky={true} />}
                <span className={clsx(isSticky && 'text-sm')}>
                  <Link
                    to={`/user/${PR.status === 'MERGED' ? lastActivity?.author : PR?.author}`}
                    className="font-medium cursor-pointer hover:underline hover:text-primary-700"
                  >
                    {PR.status === 'MERGED'
                      ? lastActivity?.author && resolveUsernameOrShorten(lastActivity?.author)
                      : PR?.author && resolveUsernameOrShorten(PR?.author)}
                  </Link>{' '}
                  {PR.status !== 'MERGED' ? 'wants to merge' : 'merged'}{' '}
                  <Link
                    to={rootTabConfig[0].getPath(PR.compareRepo.repoId, PR?.compareBranch)}
                    className="text-primary-600 bg-primary-200 px-1 cursor-pointer"
                  >
                    {isMergeInSameRepo
                      ? PR?.compareBranch
                      : `${resolveUsernameOrShorten(compareRepoOwner)}:${PR?.compareBranch}`}
                  </Link>{' '}
                  into{' '}
                  <Link
                    to={rootTabConfig[0].getPath(PR.baseRepo.repoId, PR?.baseBranch)}
                    className="text-primary-600 bg-primary-200 px-1 cursor-pointer"
                  >
                    {isMergeInSameRepo ? PR?.baseBranch : `${resolveUsernameOrShorten(repo.owner)}:${PR?.baseBranch}`}
                  </Link>{' '}
                  {PR.status === 'MERGED' &&
                    PR.mergedTimestamp &&
                    formatDistanceToNow(new Date(PR.mergedTimestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          {isSticky && contributorOrPRAuthor && (
            <div className="flex items-center">
              <ActionButton
                isMergable={isMergable}
                isContributor={contributor}
                isPRAuthor={connectedAddress === PR.author}
              />
            </div>
          )}
        </div>
      </div>
    </Sticky>
  )
}
