import { formatDistanceToNow } from 'date-fns'
import { AiOutlineIssuesClose } from 'react-icons/ai'
import { FaArrowLeft } from 'react-icons/fa'
import { GoIssueClosed } from 'react-icons/go'
import { VscIssues } from 'react-icons/vsc'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import IssueTitle from '@/components/IssuePr/Title'
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
  const navigate = useNavigate()

  const StatusComponent = statusMap[issue.status]

  function goBack() {
    navigate(`/repository/${issue.repoId}/issues`)
  }

  return (
    <div className="flex flex-col gap-2 border-b-[1px] border-gray-200 pb-4">
      <div>
        <Button onClick={goBack} variant="primary-solid">
          <FaArrowLeft className="h-4 w-4 text-white" />
        </Button>
      </div>
      <IssueTitle issueOrPr={issue} />
      <div className="flex items-center gap-4">
        {issue && <StatusComponent status={issue!.status} />}
        <div className="text-gray-600">
          {shortenAddress(issue.author)} has opened this issue{' '}
          {formatDistanceToNow(new Date(issue.timestamp), { addSuffix: true })}
        </div>
      </div>
    </div>
  )
}
