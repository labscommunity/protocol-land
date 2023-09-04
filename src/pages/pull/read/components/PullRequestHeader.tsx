import { FiGitMerge, FiGitPullRequest } from 'react-icons/fi'
import { RiGitClosePullRequestLine } from 'react-icons/ri'

import { shortenAddress } from '@/helpers/shortenAddress'
import { PullRequest, PullRequestStatus } from '@/types/repository'

const statusMap = {
  OPEN: ({ status }: { status: PullRequestStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-[#38a457] text-white px-4 py-2 rounded-full font-medium">
      <FiGitPullRequest className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  ),
  CLOSED: ({ status }: { status: PullRequestStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-red-700 text-white px-4 py-2 rounded-full font-medium">
      <RiGitClosePullRequestLine className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  ),
  MERGED: ({ status }: { status: PullRequestStatus }) => (
    <span className="flex gap-2 items-center capitalize bg-purple-700 text-white px-4 py-2 rounded-full font-medium">
      <FiGitMerge className="w-5 h-5" /> {status.toLowerCase()}
    </span>
  )
}

export default function PullRequestHeader({ PR }: { PR: PullRequest }) {
  const StatusComponent = statusMap[PR.status]
  return (
    <div className="flex flex-col gap-2 border-b-[1px] border-[#cbc9f6] pb-4">
      <h1 className="text-3xl text-liberty-dark-100">
        {PR?.title} <span className="text-[#A942F9] ml-2">#{PR?.id}</span>
      </h1>
      <div className="flex items-center gap-4">
        {PR && <StatusComponent status={PR!.status} />}
        <div className="text-liberty-dark-100 text-lg">
          <span className="font-medium">{PR?.author && shortenAddress(PR?.author)} </span>
          wants to merge <span className="text-[#3871cb] bg-[#cadeff] px-1">{PR?.compareBranch}</span> into{' '}
          <span className="text-[#3871cb] bg-[#cadeff] px-1">{PR?.baseBranch}</span>
        </div>
      </div>
    </div>
  )
}
