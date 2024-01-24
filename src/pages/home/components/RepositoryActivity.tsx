import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { ActivityProps, RepositoryActivityType } from '@/types/explore'

import { getRepoContributionsCount } from '../utils'
import ActivityHeader from './ActivityHeader'

export default function RepositoryActivity({
  activity,
  setIsForkModalOpen,
  setRepo
}: ActivityProps<RepositoryActivityType>) {
  const [contributionsCount, setContributionsCount] = useState(0)
  const openPullsCount = activity.repo.pullRequests.filter((pull) => pull.status === 'OPEN').length
  const openIssuesCount = activity.repo.issues.filter((issue) => issue.status === 'OPEN').length

  useEffect(() => {
    getRepoContributionsCount(activity.repo.name).then((count) => {
      setContributionsCount(count)
    })
  }, [])

  return (
    <div className="w-full flex justify-between items-start border border-primary-500 rounded-md p-4">
      <div className="w-full flex flex-col gap-1">
        <ActivityHeader activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />

        <div className="text-sm">{activity.repo.description}</div>
        <div className="flex gap-3 items-center text-sm justify-between">
          <span>
            {activity.created ? (activity.repo.fork ? 'Forked' : 'Created') : 'Updated'} by{' '}
            <Link className="text-primary-600 hover:text-primary-70" to={`/user/${activity.author}`}>
              {shortenAddress(activity.author)}
            </Link>{' '}
            {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
          </span>
          <div className="flex gap-3 items-center">
            <span>{openPullsCount} Open Pull Requests</span>
            <div className="h-1 w-1 rounded-full bg-gray-400"></div>
            <span>{openIssuesCount} Open Issues</span>
            <div className="h-1 w-1 rounded-full bg-gray-400"></div>
            <span>{contributionsCount} Contributions</span>
          </div>
        </div>
      </div>
    </div>
  )
}
