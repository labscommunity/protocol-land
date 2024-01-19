import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { ActivityProps, PullRequestActivityType } from '@/types/explore'

import ActivityHeader from './ActivityHeader'

export default function PullRequestActivity({
  activity,
  setIsForkModalOpen,
  setRepo
}: ActivityProps<PullRequestActivityType>) {
  const pullRequest = activity.pullRequest!
  const commentsCount = pullRequest.activities.filter((act) => act.type === 'COMMENT').length

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
        <div className="flex gap-3 flex-shrink-0 items-center text-sm">
          <div className="flex gap-1 items-center">
            <div
              className={clsx(
                'h-2 w-2 rounded-full',
                pullRequest.status === 'OPEN'
                  ? 'bg-green-700'
                  : pullRequest.status === 'CLOSED'
                  ? 'bg-red-700'
                  : 'bg-purple-700'
              )}
            ></div>
            Pull Request
            <span>
              {pullRequest.status === 'OPEN'
                ? activity.created
                  ? 'opened'
                  : 'reopened'
                : pullRequest.status.toLowerCase()}{' '}
              by{' '}
              <Link className="text-primary-600 hover:text-primary-700" to={`/user/${pullRequest.author}`}>
                {shortenAddress(pullRequest.author)}
              </Link>
            </span>
            {pullRequest.status !== 'MERGED' && pullRequest.timestamp && (
              <span> {formatDistanceToNow(new Date(pullRequest.timestamp), { addSuffix: true })}</span>
            )}
            {pullRequest.status === 'MERGED' && pullRequest.mergedTimestamp && (
              <span> {formatDistanceToNow(new Date(pullRequest.mergedTimestamp), { addSuffix: true })}</span>
            )}
          </div>
          <div className="h-1 w-1 rounded-full bg-gray-400"></div>
          <div>{commentsCount} Comments</div>
        </div>
      </div>
    </div>
  )
}
