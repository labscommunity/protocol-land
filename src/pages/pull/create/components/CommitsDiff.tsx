import { PiSmileySad } from 'react-icons/pi'

import CommitRow from '@/components/CommitRow'
import { CommitResult } from '@/types/commit'

export default function CommitsDiff({ commits = [] }: { commits: CommitResult[] }) {
  if (commits.length === 0) {
    return (
      <div className="w-full flex flex-col items-center gap-2 text-liberty-dark-100 py-4">
        <PiSmileySad className="h-10 w-10" />
        <h1 className="text-2xl">Nothing to compare here</h1>
        <p className="text-lg">Please select different branch to generate valid comparision</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl text-liberty-dark-100">Commits</h1>
      <div className="w-full flex flex-col items-center gap-4 text-liberty-dark-100 bg-white py-6 px-10 rounded-lg shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] max-h-[250px] overflow-y-auto">
        {commits.map((commit) => (
          <CommitRow commit={commit} />
        ))}
      </div>
    </div>
  )
}
