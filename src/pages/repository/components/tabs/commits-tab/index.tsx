import { FiGitCommit } from 'react-icons/fi'

import { shortenAddress } from '@/helpers/shortenAddress'
import useCommit from '@/pages/repository/hooks/useCommit'

export default function CommitsTab() {
  const { commitsList } = useCommit()

  return (
    <div className="h-full w-full px-2 py-2 flex flex-col">
      {commitsList.map((commit) => (
        <div className="w-full py-2 flex gap-4 relative items-center before:bg-liberty-dark-100 before:content-[''] before:absolute before:left-0 before:top-0 before:w-[2px] before:h-full before:block">
          <div className="ml-2 z-[1] relative">
            <FiGitCommit className="h-5 w-5 text-liberty-dark-100" />
          </div>
          <div className="flex justify-between flex-1 border-[1.2px] border-l-liberty-light-400 bg-liberty-light-800 rounded-lg w-full px-4 py-2">
            <div className="flex gap-6">
              <span className="text-[whitesmoke]">{shortenAddress(commit.commit.author.name)}</span>
              <div className="w-[1px] h-full bg-[#aeabdd]" />
              <span className="text-[whitesmoke] font-medium">{commit.commit.message}</span>
            </div>
            <div className="flex gap-6">
              <span className="text-[whitesmoke]">{commit.oid.slice(0, 7)}</span>
              <span className="text-[whitesmoke]">3 days ago</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
