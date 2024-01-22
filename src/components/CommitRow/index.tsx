import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { CommitResult } from '@/types/commit'

export default function CommitRow({ commit }: { commit: CommitResult }) {
  return (
    <div className="flex justify-between flex-1 border-[1px] border-gray-300 bg-gray-200 rounded-lg w-full px-4 py-2">
      <div className="flex flex-col">
        <span className="text-gray-900 font-medium">{commit.commit.message}</span>
        <div className="flex flex-row text-gray-600 hover:text-gray-900 gap-1">
          <Link className="hover:underline" to={`/user/${commit.commit.author.name}`}>
            {resolveUsernameOrShorten(commit.commit.author.name)}
          </Link>
          <span>
            committed {formatDistanceToNow(new Date(commit.commit.committer.timestamp * 1000), { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="flex gap-6">
        <span className="text-gray-900">{commit.oid.slice(0, 7)}</span>
      </div>
    </div>
  )
}
