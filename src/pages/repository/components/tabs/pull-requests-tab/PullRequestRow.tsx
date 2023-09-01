import { FiGitMerge, FiGitPullRequest } from 'react-icons/fi'
import { RiGitClosePullRequestLine } from 'react-icons/ri'

type Props = {
  status: 'OPEN' | 'CLOSED' | 'MERGED'
}

const STATUS_TO_ICON_MAP = {
  OPEN: () => <FiGitPullRequest className="w-5 h-5 text-green-700" />,
  CLOSED: () => <RiGitClosePullRequestLine className="w-5 h-5 text-red-700" />,
  MERGED: () => <FiGitMerge className="w-5 h-5 text-purple-700" />
}

export default function PullRequestRow({ status }: Props) {
  const Icon = STATUS_TO_ICON_MAP[status]

  return (
    <div className="flex cursor-pointer justify-between hover:bg-liberty-light-300 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-600 last:border-b-0">
      <div className="flex items-center gap-2">
        <Icon />
        <span className="font-medium text-lg">feat: add new features to protocol land</span>
      </div>
      <div className="flex gap-3 text-liberty-dark-100">
        <span className="font-semibold">#001</span>
        <span>opened by 45646548....646548798</span>
        <span> 1 week ago</span>
      </div>
    </div>
  )
}
