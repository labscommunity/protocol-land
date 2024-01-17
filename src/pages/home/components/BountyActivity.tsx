import { formatDistanceToNow } from 'date-fns'
import { TbMoneybag } from 'react-icons/tb'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { ActivityProps, BountyActivityType } from '@/types/explore'

import ForkButton from './ForkButton'

const STATUS_TO_ICON_MAP = {
  ACTIVE: () => <TbMoneybag className="w-4 h-4 text-green-700" />,
  CLOSED: () => <TbMoneybag className="w-4 h-4 text-red-700" />,
  EXPIRED: () => <TbMoneybag className="w-4 h-4 text-red-700" />,
  CLAIMED: () => <TbMoneybag className="w-4 h-4 text-purple-700" />
}

export default function BountyActivity({ activity, setIsForkModalOpen, setRepo }: ActivityProps<BountyActivityType>) {
  const bounty = activity.bounty!
  const isActive = new Date().getTime() < bounty.expiry * 1000 && activity.bounty?.status === 'ACTIVE'

  if (!isActive && bounty.status === 'ACTIVE') {
    bounty.status = 'EXPIRED'
  }
  const Icon = STATUS_TO_ICON_MAP[bounty.status]

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
        <Link to={`/repository/${activity.repo.id}/issue/${activity.issue?.id}`} className="text-base font-medium">
          <>{activity.bounty?.amount ?? ''} AR</>
        </Link>
        <div className="text-sm">{activity.issue?.title ?? ''} AR</div>
        <div className="flex items-center gap-1 text-sm">
          <Icon />
          <span>
            {isActive ? 'Bounty expires in' : `Bounty ${bounty.status.toLowerCase()}`}{' '}
            {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
          </span>
        </div>
      </div>
      <ForkButton activity={activity} setIsForkModalOpen={setIsForkModalOpen} setRepo={setRepo} />
    </div>
  )
}
