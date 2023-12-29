import { formatDistanceToNow } from 'date-fns'
import { FiGitMerge, FiGitPullRequest } from 'react-icons/fi'
import { RiGitClosePullRequestLine } from 'react-icons/ri'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'

type Props = {
  status: 'OPEN' | 'CLOSED' | 'MERGED'
  title: string
  id: number
  author: string
  timestamp: number
  mergedTimestamp?: number
}

const STATUS_TO_ICON_MAP = {
  OPEN: () => <FiGitPullRequest className="w-5 h-5 text-green-700" />,
  CLOSED: () => <RiGitClosePullRequestLine className="w-5 h-5 text-red-700" />,
  MERGED: () => <FiGitMerge className="w-5 h-5 text-purple-700" />
}

export default function PullRequestRow({ status, author, id, title, timestamp, mergedTimestamp }: Props) {
  const navigate = useNavigate()
  const { id: repoId } = useParams()

  const Icon = STATUS_TO_ICON_MAP[status]

  function handlePRRowClick() {
    if (repoId) {
      navigate(`/repository/${repoId}/pull/${id}`)
    }
  }
  return (
    <div
      onClick={handlePRRowClick}
      className="flex cursor-pointer bg-gray-50 justify-between text-gray-600 hover:text-gray-900 hover:bg-primary-50 items-center gap-2 py-2 px-4 border-b-[1px] border-gray-300 last:border-b-0"
    >
      <div className="flex gap-2">
        <div className="mt-1">
          <Icon />
        </div>
        <span className="font-medium text-lg">{title}</span>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <span className="font-semibold">#{id}</span>
        {status !== 'MERGED' ? (
          <span>opened by {shortenAddress(author)}</span>
        ) : (
          <span>by {shortenAddress(author)} was merged</span>
        )}
        {status !== 'MERGED' && timestamp && (
          <span> {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
        )}
        {status === 'MERGED' && mergedTimestamp && (
          <span> {formatDistanceToNow(new Date(mergedTimestamp), { addSuffix: true })}</span>
        )}
      </div>
    </div>
  )
}
