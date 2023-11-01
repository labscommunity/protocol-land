import { formatDistanceToNow } from 'date-fns'
import { AiOutlineIssuesClose } from 'react-icons/ai'
import { GoIssueClosed } from 'react-icons/go'
import { VscIssues } from 'react-icons/vsc'

import { shortenAddress } from '@/helpers/shortenAddress'
import { Issue, IssueStatus } from '@/types/repository'

const statusMap = {
  OPEN: ({ status }: { status: IssueStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-[#38a457] text-white px-4 py-2 rounded-full font-medium">
      <VscIssues className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  ),
  CLOSED: ({ status }: { status: IssueStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-red-700 text-white px-4 py-2 rounded-full font-medium">
      <AiOutlineIssuesClose className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  ),
  COMPLETED: ({ status }: { status: IssueStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-purple-700 text-white px-4 py-2 rounded-full font-medium">
      <GoIssueClosed className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  )
}

export default function IssueHeader({ issue }: { issue: Issue }) {
  const StatusComponent = statusMap[issue.status]

  return (
    <div className="flex flex-col gap-2 border-b-[1px] border-gray-200 pb-4">
      <h1 className="text-3xl text-gray-900">
        {issue?.title} <span className="text-primary-600 ml-2">#{issue?.id}</span>
      </h1>
      <div className="flex items-center gap-4">
        {issue && <StatusComponent status={issue!.status} />}
        <div className='text-gray-600'>
          {shortenAddress(issue.author)} has opened this issue{' '}
          {formatDistanceToNow(new Date(issue.timestamp), { addSuffix: true })}
        </div>
      </div>
    </div>
  )
}
