import { MdError } from 'react-icons/md'

export default function RepoError() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex w-full">
        <div className="border-liberty-light-200 border-[1.5px] w-full rounded-lg bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          <div className="flex justify-between bg-liberty-light-800 text-[whitesmoke] items-center gap-2 py-5 px-4 border-b-[1px] border-liberty-light-400"></div>
          <div className="py-6 flex gap-2 justify-center items-center">
            <MdError className="w-8 h-8 text-red-500" /> <h1 className="text-lg text-red-500 font-medium">Failed to load the files</h1>
          </div>
        </div>
      </div>
    </div>
  )
}
