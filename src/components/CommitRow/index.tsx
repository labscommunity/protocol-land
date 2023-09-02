import { formatDistanceToNow } from 'date-fns'

import { shortenAddress } from '@/helpers/shortenAddress'
import { CommitResult } from '@/types/commit'

export default function CommitRow({ commit }: { commit: CommitResult }) {
  return (
    <div className="flex justify-between flex-1 border-[1.2px] border-l-liberty-light-400 bg-liberty-light-800 rounded-lg w-full px-4 py-2">
      <div className="flex gap-6">
        <span className="text-[whitesmoke]">{shortenAddress(commit.commit.author.name)}</span>
        <div className="w-[1px] h-full bg-[#aeabdd]" />
        <span className="text-[whitesmoke] font-medium">{commit.commit.message}</span>
      </div>
      <div className="flex gap-6">
        <span className="text-[whitesmoke]">{commit.oid.slice(0, 7)}</span>
        <span className="text-[whitesmoke]">
          {formatDistanceToNow(new Date(commit.commit.committer.timestamp * 1000), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}
