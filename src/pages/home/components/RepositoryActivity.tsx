import { formatDistanceToNow } from 'date-fns'

import { ActivityProps, RepositoryActivityType } from '@/types/explore'

import ActivityHeader from './ActivityHeader'
import ForkButton from './ForkButton'

export default function RepositoryActivity({
  activity,
  setIsForkModalOpen,
  setRepo
}: ActivityProps<RepositoryActivityType>) {
  const openPullsCount = activity.repo.pullRequests.filter((pull) => pull.status === 'OPEN').length
  const openIssuesCount = activity.repo.issues.filter((issue) => issue.status === 'OPEN').length

  return (
    <div className="w-full flex justify-between items-start border border-primary-500 rounded-md p-4">
      <div className="w-full flex flex-col gap-1">
        <div className="w-full flex justify-between">
          <ActivityHeader repo={activity.repo} />
          <ForkButton activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />
        </div>
        <div className="text-sm">{activity.repo.description}</div>
        <div className="flex gap-3 items-center text-sm">
          <span>
            {activity.created ? 'Created' : 'Updated'}{' '}
            {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
          </span>
          <div className="h-1 w-1 rounded-full bg-gray-400"></div>
          <span>{openPullsCount} Open Pull Requests</span>
          <div className="h-1 w-1 rounded-full bg-gray-400"></div>
          <span>{openIssuesCount} Open Issues</span>
        </div>
      </div>
    </div>
  )
}
