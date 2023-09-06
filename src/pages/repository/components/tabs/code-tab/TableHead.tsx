import { formatDistanceToNow } from 'date-fns'

import { shortenAddress } from '@/helpers/shortenAddress'
import { CommitResult } from '@/types/commit'

export default function TableHead({ commit }: { commit: CommitResult }) {
  return (
    <div className="flex justify-between bg-liberty-light-800 text-[whitesmoke] items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-400">
      {commit && (
        <>
          <span title={commit.commit.author.name}>{shortenAddress(commit.commit.author.name)}</span>
          <div className="gap-8 flex justify-between">
            <span>{commit.commit.message}</span>
            <span>{commit.oid.slice(0, 7)}</span>
            <span>{formatDistanceToNow(new Date(commit.commit.committer.timestamp * 1000), { addSuffix: true })}</span>
          </div>
        </>
      )}
    </div>
  )
}
