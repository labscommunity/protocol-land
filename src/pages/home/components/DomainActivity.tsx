import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import UserPopover from '@/components/Popovers/UserPopover'
import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { ActivityProps, DomainActivityType } from '@/types/explore'

import ActivityHeader from './ActivityHeader'

export default function DomainActivity({ activity, setIsForkModalOpen, setRepo }: ActivityProps<DomainActivityType>) {
  const domain = activity.domain!

  return (
    <div className="w-full flex justify-between items-start border border-primary-500 rounded-md p-4">
      <div className="flex w-full flex-col gap-1">
        <ActivityHeader activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />

        <Link className="text-base font-medium" to={`/repository/${activity.repo.id}/deployments`}>
          {domain.name}
        </Link>

        <div className="flex items-center gap-1 text-sm justify-between flex-wrap">
          <span>
            ArNS Domain {activity.created ? 'added' : 'updated'} by{' '}
            <UserPopover userAddress={domain.controller}>
              <Link className="text-primary-600 hover:text-primary-700" to={`/user/${domain.controller}`}>
                {resolveUsernameOrShorten(domain.controller)}
              </Link>
            </UserPopover>{' '}
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </span>

          <span>1 Active Domain</span>
        </div>
      </div>
    </div>
  )
}
