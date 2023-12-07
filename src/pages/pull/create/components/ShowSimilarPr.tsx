import { FiGitPullRequest } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { removeMarkdown } from '@/helpers/removeMarkdown'
import { PullRequest } from '@/types/repository'

export default function ShowSimilarPr({ PR }: { PR: PullRequest }) {
  const navigate = useNavigate()

  function gotoIssue() {
    navigate(`/repository/${PR.repoId}/pull/${PR.id}`)
  }

  return (
    <div className="flex justify-between gap-4 border border-slate-300 p-4 items-center rounded-md">
      <div className="flex gap-2">
        <div>
          <FiGitPullRequest className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <span
            className="font-medium text-md hover:underline hover:text-primary-700 cursor-pointer"
            onClick={gotoIssue}
          >
            {PR.title}
          </span>
          <span className="text-slate-500 ml-2">#{PR.id}</span>
          <span
            className="text-slate-700 text-sm line-clamp-1 hover:underline hover:text-primary-700 cursor-pointer"
            onClick={gotoIssue}
          >
            {removeMarkdown(PR.description)}
          </span>
        </div>
      </div>
      <div>
        <Button variant="primary-solid" className="h-9 w-[184px]" onClick={gotoIssue}>
          <FiGitPullRequest className="w-5 h-5 text-white" />
          <span className="pl-1">View pull request</span>
        </Button>
      </div>
    </div>
  )
}
