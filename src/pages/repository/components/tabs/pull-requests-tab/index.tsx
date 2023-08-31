import PullRequestRow from './PullRequestRow'
import TableHeader from './TableHeader'

export default function PullRequestsTab() {
  return (
    <div className="w-full pb-6 flex gap-8">
      <div className="flex flex-col w-full">
        <TableHeader />
        <div className="rounded-b-lg w-full bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          <PullRequestRow status="OPEN" />
          <PullRequestRow status="CLOSED" />
          <PullRequestRow status="MERGED" />
        </div>
      </div>
    </div>
  )
}
