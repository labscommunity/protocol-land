import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { ActivityProps, DeploymentActivityType } from '@/types/explore'

import ActivityHeader from './ActivityHeader'
import ForkButton from './ForkButton'

export default function DeploymentActivity({
  activity,
  setIsForkModalOpen,
  setRepo
}: ActivityProps<DeploymentActivityType>) {
  const deployment = activity.deployment!
  const deploymentsCount = activity.repo.deployments.length

  return (
    <div className="w-full flex justify-between items-start border border-primary-500 rounded-md p-4">
      <div className="flex w-full flex-col gap-1">
        <div className="w-full flex justify-between">
          <ActivityHeader repo={activity.repo} />
          <ForkButton activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />
        </div>

        <Link className="text-base font-medium" to={`/repository/${activity.repo.id}/deployments`}>
          {deployment.commitMessage}
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <span>
            Deployment done by{' '}
            <Link className="text-primary-600 hover:text-primary-700" to={`/user/${deployment.deployedBy}`}>
              {shortenAddress(deployment.deployedBy)}
            </Link>{' '}
            {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
          </span>
          <div className="h-1 w-1 rounded-full bg-gray-400"></div>
          <span>{deploymentsCount} Deployments</span>
        </div>
      </div>
    </div>
  )
}
