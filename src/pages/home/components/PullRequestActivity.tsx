import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import UserPopover from '@/components/Popovers/UserPopover'
import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { ActivityProps, PullRequestActivityType } from '@/types/explore'

import ActivityHeader from './ActivityHeader'

export default function PullRequestActivity({
  activity,
  setIsForkModalOpen,
  setRepo
}: ActivityProps<PullRequestActivityType>) {
  const pullRequest = activity.pullRequest!
  const commentsCount = pullRequest.comments

  return (
    <div className="w-full flex justify-between items-start border border-primary-500 rounded-md p-4">
      <div className="flex w-full flex-col gap-1">
        <ActivityHeader activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />

        <Link
          to={`/repository/${activity.repo.id}/${pullRequest?.id ? `pull/${pullRequest.id}` : `pulls`}`}
          className="text-base font-medium flex gap-2"
        >
          <span>{pullRequest?.title ?? ''}</span>
          {pullRequest?.id && <span className="text-gray-400">#{pullRequest?.id}</span>}
        </Link>
        <div className="flex gap-1 flex-shrink-0 items-center text-sm justify-between flex-wrap">
          <div className="flex gap-1 flex-wrap items-center">
            <div
              className={clsx(
                'px-2 rounded-full text-white',
                pullRequest.status === 'OPEN'
                  ? 'bg-green-700'
                  : pullRequest.status === 'CLOSED'
                  ? 'bg-red-700'
                  : 'bg-purple-700'
              )}
            >
              Pull Request
            </div>
            <span>
              {pullRequest.status === 'OPEN'
                ? activity.created
                  ? 'opened'
                  : 'reopened'
                : pullRequest.status.toLowerCase()}{' '}
              by{' '}
              <UserPopover userAddress={pullRequest.author}>
                <Link
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                  to={`/user/${pullRequest.author}`}
                >
                  {resolveUsernameOrShorten(pullRequest.author)}
                </Link>
              </UserPopover>
            </span>
            {pullRequest.status !== 'MERGED' && pullRequest.timestamp && (
              <span> {formatDistanceToNow(new Date(pullRequest.timestamp), { addSuffix: true })}</span>
            )}
            {pullRequest.status === 'MERGED' && pullRequest.mergedTimestamp && (
              <span> {formatDistanceToNow(new Date(pullRequest.mergedTimestamp), { addSuffix: true })}</span>
            )}
          </div>
          <div>{commentsCount} Comments</div>
        </div>
      </div>
    </div>
  )
}
