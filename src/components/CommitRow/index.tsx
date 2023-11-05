import { formatDistanceToNow } from 'date-fns'

import { shortenAddress } from '@/helpers/shortenAddress'
import { CommitResult } from '@/types/commit'

export default function CommitRow({ commit }: { commit: CommitResult }) {
  return (
    <div className="flex justify-between flex-1 border-[1px] border-gray-300 bg-gray-200 rounded-lg w-full px-4 py-2">
      <div className="flex gap-6">
        <span className="text-gray-900">{shortenAddress(commit.commit.author.name)}</span>
        <div className="w-[1px] h-full bg-gray-400" />
        <span className="text-gray-900 font-medium">{commit.commit.message}</span>
      </div>
      <div className="flex gap-6">
        <span className="text-gray-900">{commit.oid.slice(0, 7)}</span>
        <span className="text-gray-900">
          {formatDistanceToNow(new Date(commit.commit.committer.timestamp * 1000), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}
