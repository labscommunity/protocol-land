import { FiGitMerge, FiGitPullRequest } from 'react-icons/fi'

export default function PullRequestsTab() {
  return (
    <div className="w-full pb-6 flex gap-8">
      <div className="flex flex-col w-full">
        {/* table-head */}
        <div className="rounded-t-lg flex justify-between bg-liberty-light-800 text-[whitesmoke] items-center gap-2 py-2 px-4">
          <div className="flex items-center">
            <span className="font-medium px-4 py-1 rounded-full hover:bg-[#4487F5] cursor-pointer">Open</span>
            <span className="font-medium px-4 py-1 rounded-full hover:bg-[#4487F5] cursor-pointer">Closed</span>
          </div>
        </div>
        {/* table-head */}
        <div className="rounded-b-lg w-full bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          <div className="flex cursor-pointer justify-between hover:bg-liberty-light-300 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-600 last:border-b-0">
            <div className="flex items-center gap-2">
              <FiGitPullRequest className="w-5 h-5 text-green-700" />
              <span className="font-medium text-lg">feat: add new features to protocol land</span>
            </div>
            <div className="flex gap-3 text-liberty-dark-100">
              <span>#001</span>
              <span>opened by 45646548....646548798</span>
              <span> 1 week ago</span>
            </div>
          </div>
          <div className="flex justify-between cursor-pointer hover:bg-liberty-light-300 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-600 last:border-b-0">
            <div className="flex items-center gap-2">
              <FiGitMerge className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-lg">feat: add new features to protocol land</span>
            </div>
            <div className="flex gap-3 text-liberty-dark-100">
              <span>#001</span>
              <span>merged</span>
              <span>by 45646548....646548798</span>
              <span> 1 week ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
