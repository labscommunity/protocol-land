import { FiPlus } from 'react-icons/fi'

export default function Sidebar() {
  return (
    <div className="flex flex-col w-[25%]">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center border-b-[1px] border-[#cbc9f6] pb-1 text-liberty-dark-100">
          <h1 className="text-lg font-medium">Reviewers</h1>
          <FiPlus className="h-5 w-5 cursor-pointer" />
        </div>
        <div>
          <p className="text-liberty-dark-100">No reviews yet</p>
        </div>
      </div>
    </div>
  )
}
