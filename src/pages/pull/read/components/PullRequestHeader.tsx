import { FaArrowLeft } from 'react-icons/fa'
import { FiGitMerge, FiGitPullRequest } from 'react-icons/fi'
import { RiGitClosePullRequestLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
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
  const navigate = useNavigate()

  function goBack() {
    navigate(-1)
  }

  return (
    <div className="flex flex-col gap-2 border-b-[1px] border-gray-200 pb-4">
      <div>
        <Button onClick={goBack} variant="primary-solid">
          <FaArrowLeft className="h-4 w-4 text-white" />
        </Button>
      </div>
      <h1 className="text-3xl text-gray-900">
        {PR?.title} <span className="text-primary-600 ml-2">#{PR?.id}</span>
      </h1>
      <div className="flex items-center gap-4">
        {PR && <StatusComponent status={PR!.status} />}
        <div className="text-gray-900 text-lg">
          <span className="font-medium">{PR?.author && shortenAddress(PR?.author)} </span>
          wants to merge <span className="text-primary-600 bg-primary-200 px-1">{PR?.compareBranch}</span> into{' '}
          <span className="text-primary-600 bg-primary-200 px-1">{PR?.baseBranch}</span>
        </div>
      </div>
    </div>
  )
}
