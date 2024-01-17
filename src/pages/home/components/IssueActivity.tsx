import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { ActivityProps, IssueActivityType } from '@/types/explore'

import ForkButton from './ForkButton'

export default function IssueActivity({ activity, setIsForkModalOpen, setRepo }: ActivityProps<IssueActivityType>) {
  const issue = activity.issue!
  const isOpen = issue.status === 'OPEN'

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
          to={`/repository/${activity.repo.id}/${issue?.id ? `issue/${issue.id}` : `issues`}`}
          className="text-base font-medium flex gap-2"
        >
          <span>{issue?.title ?? ''}</span>
          {issue?.id && <span className="text-gray-400">#{issue?.id}</span>}
        </Link>
        <div className="flex gap-1 flex-shrink-0 items-center text-sm">
          <div className={clsx('h-2 w-2 rounded-full', isOpen ? 'bg-[#38a457]' : 'bg-purple-700')}></div>
          Issue
          {isOpen ? <span>{activity.created ? 'opened' : 'reopened'}</span> : <span>was closed</span>}
          <span>
            by{' '}
            <Link className="text-primary-600 hover:text-primary-700" to={`/user/${issue.author}`}>
              {shortenAddress(issue.author)}
            </Link>
          </span>
          {isOpen && issue.timestamp && (
            <span>{formatDistanceToNow(new Date(issue.timestamp), { addSuffix: true })}</span>
          )}
          {!isOpen && issue.completedTimestamp && (
            <span>{formatDistanceToNow(new Date(issue.completedTimestamp), { addSuffix: true })}</span>
          )}
        </div>
      </div>
      <ForkButton activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />
    </div>
  )
}
