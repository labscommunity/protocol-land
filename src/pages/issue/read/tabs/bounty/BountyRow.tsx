import { differenceInDays, formatDistanceToNow } from 'date-fns'
import { TbMoneybag } from 'react-icons/tb'
import SVG from 'react-inlinesvg'

import ArweaveLogo from '@/assets/arweave.svg'
import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { BountyBase, BountyStatus } from '@/types/repository'

type Props = {
  status: BountyStatus
  amount: number
  id: number
  author: string
  timestamp: number
  expiry: number
  base: BountyBase
  onClick: () => void
}

const STATUS_TO_ICON_MAP = {
  ACTIVE: () => <TbMoneybag className="w-5 h-5 text-green-700" />,
  CLOSED: () => <TbMoneybag className="w-5 h-5 text-red-700" />,
  EXPIRED: () => <TbMoneybag className="w-5 h-5 text-red-700" />,
  CLAIMED: () => <TbMoneybag className="w-5 h-5 text-purple-700" />
}

const STATUS_TO_TEXT = {
  ACTIVE: '',
  CLOSED: 'been closed',
  EXPIRED: 'expired',
  CLAIMED: 'been completed'
}

export default function BountyRow({ status, author, id, amount, expiry, timestamp, onClick, base }: Props) {
  const Icon = STATUS_TO_ICON_MAP[status]

  const isActive = status === 'ACTIVE'
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer bg-gray-50 justify-between text-gray-600 hover:text-gray-900 hover:bg-primary-50 items-center gap-2 py-2 px-4 border-b-[1px] border-gray-300 last:border-b-0"
    >
      <div className="flex items-center gap-2">
        <Icon />
        <SVG
          src={ArweaveLogo}
          className="w-5 h-5 [&>circle]:stroke-gray-900 [&>circle]:stroke-[2.5] [&>circle]:fill-none [&>path]:fill-gray-900"
        />
        <span className="font-medium text-lg">
          {amount.toFixed(2)} {base}
        </span>
      </div>
      <div className="flex gap-3 text-gray-900">
        <span className="font-semibold">Reward#{id}</span>
        <span>opened by {resolveUsernameOrShorten(author)}</span>
        {timestamp && <span> {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>}
        {expiry && isActive && (
          <>
            and expires in
            <span className="font-medium">{differenceInDays(new Date(expiry * 1000), new Date())} Days</span>
          </>
        )}
        {expiry && !isActive && <>and has {STATUS_TO_TEXT[status]}!</>}
      </div>
    </div>
  )
}
