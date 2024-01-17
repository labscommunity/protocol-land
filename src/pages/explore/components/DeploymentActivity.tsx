import { formatDistanceToNow } from 'date-fns'
import { Dispatch, SetStateAction } from 'react'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { ActivityInteraction } from '@/types/explore'
import { Repo } from '@/types/repository'

import ForkButton from './ForkButton'

interface DeploymentActivityProps {
  activity: ActivityInteraction
  setIsForkModalOpen: Dispatch<SetStateAction<boolean>>
  setRepo: Dispatch<SetStateAction<Repo | undefined>>
}

export default function DeploymentActivity({ activity, setIsForkModalOpen, setRepo }: DeploymentActivityProps) {
  const deployment = activity.deployment!

  return (
    <div className="w-full flex justify-between items-start border border-primary-500 rounded-md p-4">
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <Link
            className="font-medium text-lg hover:underline text-primary-600 hover:text-primary-700 cursor-pointer"
            to={`/user/${activity.repo.owner}`}
          >
            {shortenAddress(activity.repo.owner)}
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            className="font-medium text-lg hover:underline text-primary-600 hover:text-primary-700 cursor-pointer"
            to={`/repository/${activity.repo.id}`}
          >
            {activity.repo.name}
          </Link>
        </div>

        <Link className="text-base font-medium" to={`/repository/${activity.repo.id}/deployments`}>
          {deployment.commitMessage}
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <span>
            Deployment done by{' '}
            <Link className="text-primary-600 hover:text-primary-700" to={`/user/${deployment.deployedBy}`}>
              {shortenAddress(deployment.deployedBy)}
            </Link>{' '}
            {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
          </span>
        </div>
      </div>
      <ForkButton activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />
    </div>
  )
}
