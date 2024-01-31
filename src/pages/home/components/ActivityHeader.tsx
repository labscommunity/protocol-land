import { Dispatch, SetStateAction } from 'react'
import { Link } from 'react-router-dom'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { Activity } from '@/types/explore'
import { Repo } from '@/types/repository'

import ForkButton from './ForkButton'
import RepoPopover from './RepoPopover'

interface ActivityHeaderProps {
  activity: Activity
  setIsForkModalOpen: Dispatch<SetStateAction<boolean>>
  setRepo: Dispatch<SetStateAction<Repo | undefined>>
}

export default function ActivityHeader({ activity, setIsForkModalOpen, setRepo }: ActivityHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <RepoPopover repo={activity.repo}>
            <Link
              className="font-semibold text-lg hover:underline text-primary-700 hover:text-primary-800 cursor-pointer"
              to={`/repository/${activity.repo.id}`}
            >
              {activity.repo.name}
            </Link>
          </RepoPopover>
        </div>
        <div className="border-primary-500 border text-sm px-2 rounded-md truncate">
          Owner:{' '}
          <Link
            className="font-normal hover:underline text-primary-600 hover:text-primary-700 cursor-pointer"
            to={`/user/${activity.repo.owner}`}
          >
            {resolveUsernameOrShorten(activity.repo.owner)}
          </Link>
        </div>
      </div>
      <ForkButton activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />
    </div>
  )
}
