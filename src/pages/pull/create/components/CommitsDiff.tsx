import { PiSmileySad } from 'react-icons/pi'

import CommitRow from '@/components/CommitRow'
import { CommitResult } from '@/types/commit'

export default function CommitsDiff({ commits = [] }: { commits: CommitResult[] }) {
  if (commits.length === 0) {
    return (
      <div className="w-full flex flex-col items-center gap-2 text-gray-900 py-4">
        <PiSmileySad className="h-10 w-10" />
        <h1 className="text-2xl">Nothing to compare here</h1>
        <p className="text-lg">Please select different branch to generate valid comparision</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl text-gray-900">Commits</h1>
      <div className="w-full border-[1px] border-gray-300 flex flex-col items-center gap-4 text-gray-900 bg-white py-6 px-10 rounded-lg max-h-[250px] overflow-y-auto">
        {commits.map((commit) => (
          <CommitRow commit={commit} />
        ))}
      </div>
    </div>
  )
}
