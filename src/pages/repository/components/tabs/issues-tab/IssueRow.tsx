import { formatDistanceToNow } from 'date-fns'
import { AiOutlineIssuesClose } from 'react-icons/ai'
import { GoIssueClosed } from 'react-icons/go'
import { VscIssues } from 'react-icons/vsc'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'

type Props = {
  status: 'OPEN' | 'CLOSED' | 'COMPLETED'
  title: string
  id: number
  author: string
  timestamp: number
}

const STATUS_TO_ICON_MAP = {
  OPEN: () => <VscIssues className="w-5 h-5 text-green-700" />,
  CLOSED: () => <AiOutlineIssuesClose className="w-5 h-5 text-red-700" />,
  COMPLETED: () => <GoIssueClosed className="w-5 h-5 text-purple-700" />
}

export default function IssueRow({ status, author, id, title, timestamp }: Props) {
  const navigate = useNavigate()
  const { id: repoId } = useParams()

  const Icon = STATUS_TO_ICON_MAP[status]

  function handlePRRowClick() {
    if (repoId) {
      navigate(`/repository/${repoId}/issue/${id}`)
    }
  }
  return (
    <div
      onClick={handlePRRowClick}
      className="flex cursor-pointer bg-gray-50 justify-between text-gray-600 hover:text-gray-900 hover:bg-primary-50 items-center gap-2 py-2 px-4 border-b-[1px] border-gray-300 last:border-b-0"
    >
      <div className="flex items-center gap-2">
        <Icon />
        <span className="font-medium text-lg">{title}</span>
      </div>
      <div className="flex gap-3">
        <span className="font-semibold">#{id}</span>
        <span>opened by {shortenAddress(author)}</span>
        {timestamp && <span> {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>}
      </div>
    </div>
  )
}
