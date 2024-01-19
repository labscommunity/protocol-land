import { formatDistanceToNow } from 'date-fns'
import { TbMoneybag } from 'react-icons/tb'
import { Link } from 'react-router-dom'

import { ActivityProps, BountyActivityType } from '@/types/explore'

import ActivityHeader from './ActivityHeader'

const STATUS_TO_ICON_MAP = {
  ACTIVE: () => <TbMoneybag className="w-4 h-4 text-green-700" />,
  CLOSED: () => <TbMoneybag className="w-4 h-4 text-red-700" />,
  EXPIRED: () => <TbMoneybag className="w-4 h-4 text-red-700" />,
  CLAIMED: () => <TbMoneybag className="w-4 h-4 text-purple-700" />
}

export default function BountyActivity({ activity, setIsForkModalOpen, setRepo }: ActivityProps<BountyActivityType>) {
  const bounty = activity.bounty!
  const isActive = new Date().getTime() < bounty.expiry * 1000 && activity.bounty?.status === 'ACTIVE'
  const activeBountiesCount = activity.issue.bounties.filter(
    (bnty) => new Date().getTime() < bnty.expiry * 1000 && bnty?.status === 'ACTIVE'
  ).length

  if (!isActive && bounty.status === 'ACTIVE') {
    bounty.status = 'EXPIRED'
  }
  const Icon = STATUS_TO_ICON_MAP[bounty.status]

  return (
    <div className="w-full flex justify-between items-start border border-primary-500 rounded-md p-4">
      <div className="flex w-full flex-col gap-1">
        <ActivityHeader activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />

        <Link to={`/repository/${activity.repo.id}/issue/${activity.issue?.id}`} className="text-base font-medium">
          <>{activity.bounty?.amount ?? ''} AR</>
        </Link>
        <div className="text-sm">{activity.issue?.title ?? ''} AR</div>
        <div className="flex gap-3 text-sm items-center">
          <div className="flex items-center gap-1">
            <Icon />
            <span>
              {isActive ? 'Bounty expires in' : `Bounty ${bounty.status.toLowerCase()}`}{' '}
              {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
            </span>
          </div>
          <div className="h-1 w-1 rounded-full bg-gray-400"></div>
          <div>{activeBountiesCount} Active Bounties </div>
        </div>
      </div>
    </div>
  )
}
