import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import { isArweaveAddress } from '@/helpers/isInvalidInput'
import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { CommitResult } from '@/types/commit'

export default function CommitRow({ commit }: { commit: CommitResult }) {
  console.log(commit)
  return (
    <div className="flex justify-between flex-1 border-[1px] border-gray-300 bg-gray-200 rounded-lg w-full px-4 py-2">
      <div className="flex flex-col">
        <span className="text-gray-900 font-medium">{commit.commit.message}</span>
        <div className="inline-block text-gray-600 hover:text-gray-900">
          {isArweaveAddress(commit.commit.author.name) ? (
            <Link
              className="hover:underline hover:text-primary-700 font-medium"
              to={`/user/${commit.commit.author.name}`}
            >
              {resolveUsernameOrShorten(commit.commit.author.name)}
            </Link>
          ) : (
            <span className="cursor-pointer hover:underline hover:text-primary-700 font-medium">
              {commit.commit.author.name}
            </span>
          )}
          <span> committed </span>
          <span className="font-medium">
            {formatDistanceToNow(new Date(commit.commit.committer.timestamp * 1000), { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="flex gap-6">
        <span className="text-gray-900">{commit.oid.slice(0, 7)}</span>
      </div>
    </div>
  )
}
