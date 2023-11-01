import { FiGitCommit } from 'react-icons/fi'

import CommitRow from '@/components/CommitRow'
import { useGlobalStore } from '@/stores/globalStore'

export default function CommitsTab() {
  const [commits] = useGlobalStore((state) => [state.pullRequestState.commits])
  return (
    <div className="h-full w-full px-2 py-2 flex flex-col">
      {commits.map((commit) => (
        <div className="w-full py-2 flex gap-4 relative items-center before:bg-gray-300 before:content-[''] before:absolute before:left-0 before:top-0 before:w-[2px] before:h-full before:block">
          <div className="ml-2 z-[1] relative">
            <FiGitCommit className="h-5 w-5 text-gray-400" />
          </div>
          <CommitRow commit={commit} />
        </div>
      ))}
    </div>
  )
}
