import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { ActivityProps, DomainActivityType } from '@/types/explore'

import ForkButton from './ForkButton'

export default function DomainActivity({ activity, setIsForkModalOpen, setRepo }: ActivityProps<DomainActivityType>) {
  const domain = activity.domain!

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
          {domain.name}
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <span>
            ArNS Domain {activity.created ? 'added' : 'updated'} by{' '}
            <Link className="text-primary-600 hover:text-primary-700" to={`/user/${domain.controller}`}>
              {shortenAddress(domain.controller)}
            </Link>{' '}
            {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
          </span>
        </div>
      </div>
      <ForkButton activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />
    </div>
  )
}
