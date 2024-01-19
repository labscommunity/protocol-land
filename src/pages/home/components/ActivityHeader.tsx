import { Dispatch, SetStateAction } from 'react'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { Activity } from '@/types/explore'
import { Repo } from '@/types/repository'

import ForkButton from './ForkButton'

interface ActivityHeaderProps {
  activity: Activity
  setIsForkModalOpen: Dispatch<SetStateAction<boolean>>
  setRepo: Dispatch<SetStateAction<Repo | undefined>>
}

export default function ActivityHeader({ activity, setIsForkModalOpen, setRepo }: ActivityHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Link
          className="font-normal text-base hover:underline text-primary-600 hover:text-primary-700 cursor-pointer"
          to={`/user/${activity.repo.owner}`}
        >
          {shortenAddress(activity.repo.owner)}
        </Link>
        <span className="text-gray-400">/</span>
        <div className="flex items-center">
          <Link
            className="font-semibold text-lg hover:underline text-primary-800 hover:text-primary-900 cursor-pointer"
            to={`/repository/${activity.repo.id}`}
          >
            {activity.repo.name}
          </Link>
        </div>
      </div>
      <ForkButton activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />
    </div>
  )
}
