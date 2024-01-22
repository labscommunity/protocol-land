import { formatDistanceToNow } from 'date-fns'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { CommitResult } from '@/types/commit'

export default function TableHead({ commit }: { commit: CommitResult }) {
  return (
    <div className="flex justify-between bg-gray-200 text-gray-900 items-center gap-2 py-[10px] px-4 border-b-[1px] border-gray-300 text-sm font-medium">
      {commit && (
        <>
          <span title={commit.commit.author.name}>{resolveUsernameOrShorten(commit.commit.author.name)}</span>
          <div className="gap-8 flex justify-between">
            <span className="hidden sm:block">{commit.commit.message}</span>
            <span>{commit.oid.slice(0, 7)}</span>
            <span>{formatDistanceToNow(new Date(commit.commit.committer.timestamp * 1000), { addSuffix: true })}</span>
          </div>
        </>
      )}
      {!commit && (
        <div className="w-full py-[8px] flex justify-between">
          <div className="h-2 bg-gray-200 rounded-full w-[20%] animate-pulse"></div>
          <div className="w-1/2 flex justify-between">
            <div className="h-2 bg-gray-200 rounded-full w-[20%] animate-pulse"></div>
            <div className="h-2 bg-gray-200 rounded-full w-[20%] animate-pulse"></div>
            <div className="h-2 bg-gray-200 rounded-full w-[20%] animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  )
}
