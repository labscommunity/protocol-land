import { PiDotDuotone } from 'react-icons/pi'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { useGlobalStore } from '@/stores/globalStore'

import AssigneeAdd from './AssigneeAdd'

export default function Sidebar() {
  const [isContributor, selectedIssue, isLoggedIn] = useGlobalStore((state) => [
    state.repoCoreActions.isContributor,
    state.issuesState.selectedIssue,
    state.authState.isLoggedIn
  ])
  const contributor = isContributor()

  return (
    <div className="flex flex-col w-[20%]">
      <div className="flex flex-col gap-4 ">
        <div className="flex justify-between items-center border-b-[1px] border-gray-200 pb-1 text-gray-900">
          <h1 className="text-lg font-medium">Assignees</h1>
          {isLoggedIn && contributor && <AssigneeAdd />}
        </div>
        {selectedIssue && selectedIssue.assignees.length === 0 && (
          <div>
            <p className="text-gray-600">No assignees yet</p>
          </div>
        )}
        {selectedIssue &&
          selectedIssue.assignees.map((assignee) => (
            <div className="flex items-center gap-1 text-gray-600">
              <PiDotDuotone className="min-w-[24px] h-6 !text-yellow-500" />
              <span className="truncate">{resolveUsernameOrShorten(assignee, 6)}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
