import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { Dispatch, SetStateAction } from 'react'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { ActivityInteraction } from '@/types/explore'
import { Repo } from '@/types/repository'

import ForkButton from './ForkButton'

interface PullRequestActivityProps {
  activity: ActivityInteraction
  setIsForkModalOpen: Dispatch<SetStateAction<boolean>>
  setRepo: Dispatch<SetStateAction<Repo>>
}

export default function PullRequestActivity({ activity, setIsForkModalOpen, setRepo }: PullRequestActivityProps) {
  const pullRequest = activity.pullRequest!

  return (
    <div className="w-full flex justify-between items-start border border-primary-500 rounded-md p-4">
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <Link
            to={`/user/${activity.repo.owner}`}
            className="font-medium text-lg hover:underline text-primary-600 hover:text-primary-700 cursor-pointer"
          >
            {shortenAddress(activity.repo.owner)}
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            to={`/repository/${activity.repo.id}`}
            className="font-medium text-lg hover:underline text-primary-600 hover:text-primary-700 cursor-pointer"
          >
            {activity.repo.name}
          </Link>
        </div>
        <Link
          to={`/repository/${activity.repo.id}/${pullRequest?.id ? `pull/${pullRequest.id}` : `pulls`}`}
          className="text-base font-medium flex gap-2"
        >
          <span>{pullRequest?.title ?? ''}</span>
          <span className="text-gray-400">#{pullRequest?.id}</span>
        </Link>
        <div className="flex gap-1 flex-shrink-0 items-center text-sm">
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
          {pullRequest.status !== 'MERGED' ? (
            <span>
              opened by{' '}
              <Link className="text-primary-600 hover:text-primary-700" to={`/user/${pullRequest.author}`}>
                {shortenAddress(pullRequest.author)}
              </Link>
            </span>
          ) : (
            <span>
              by{' '}
              <Link className="text-primary-600 hover:text-primary-700" to={`/user/${pullRequest.author}`}>
                {shortenAddress(pullRequest.author)}
              </Link>{' '}
              was merged
            </span>
          )}
          {pullRequest.status !== 'MERGED' && pullRequest.timestamp && (
            <span> {formatDistanceToNow(new Date(pullRequest.timestamp), { addSuffix: true })}</span>
          )}
          {pullRequest.status === 'MERGED' && pullRequest.mergedTimestamp && (
            <span> {formatDistanceToNow(new Date(pullRequest.mergedTimestamp), { addSuffix: true })}</span>
          )}
        </div>
      </div>
      <ForkButton activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />
    </div>
  )
}
