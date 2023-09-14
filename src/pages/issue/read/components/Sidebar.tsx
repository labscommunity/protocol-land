import { PiDotDuotone } from 'react-icons/pi'

import { useGlobalStore } from '@/stores/globalStore'

import AssigneeAdd from './AssigneeAdd'

export default function Sidebar() {
  const [selectedIssue] = useGlobalStore((state) => [state.issuesState.selectedIssue, state.authState.address])
  return (
    <div className="flex flex-col w-[20%]">
      <div className="flex flex-col gap-4 ">
        <div className="flex justify-between items-center border-b-[1px] border-[#cbc9f6] pb-1 text-liberty-dark-100">
          <h1 className="text-lg font-medium">Assignees</h1>
          <AssigneeAdd />
        </div>
        {selectedIssue && selectedIssue.assignees.length === 0 && (
          <div>
            <p className="text-liberty-dark-100">No assignees yet</p>
          </div>
        )}
        {selectedIssue &&
          selectedIssue.assignees.map((assignee) => (
            <div className="flex items-center gap-1 text-liberty-dark-100">
              <PiDotDuotone className="min-w-[24px] h-6 !text-yellow-500" />
              <span className="truncate">{assignee}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
