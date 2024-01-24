import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { ActivityProps, DeploymentActivityType } from '@/types/explore'

import ActivityHeader from './ActivityHeader'

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
        <ActivityHeader activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />

        <Link className="text-base font-medium" to={`/repository/${activity.repo.id}/deployments`}>
          {deployment.commitMessage}
        </Link>

        <div className="flex items-center gap-1 text-sm justify-between flex-wrap">
          <span>
            Deployment done by{' '}
            <Link className="text-primary-600 hover:text-primary-700" to={`/user/${deployment.deployedBy}`}>
              {resolveUsernameOrShorten(deployment.deployedBy)}
            </Link>{' '}
            {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
          </span>

          <span>{deploymentsCount} Deployments</span>
        </div>
      </div>
    </div>
  )
}
