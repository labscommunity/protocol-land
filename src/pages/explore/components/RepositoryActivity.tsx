import { formatDistanceToNow } from 'date-fns'
import { Dispatch, SetStateAction } from 'react'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { ActivityInteraction } from '@/types/explore'
import { Repo } from '@/types/repository'

import ForkButton from './ForkButton'

interface RepositoryActivityProps {
  activity: ActivityInteraction
  setIsForkModalOpen: Dispatch<SetStateAction<boolean>>
  setRepo: Dispatch<SetStateAction<Repo>>
}

export default function RepositoryActivity({ activity, setIsForkModalOpen, setRepo }: RepositoryActivityProps) {
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
        <div className="text-sm">{activity.repo.description}</div>
        <div className="text-sm">
          {activity.created ? 'Created' : 'Updated'}{' '}
          {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
        </div>
      </div>
      <ForkButton activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />
    </div>
  )
}
