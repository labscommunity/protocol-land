export default function RepoLoading() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex w-full">
        <div className="border-liberty-light-200 border-[1.5px] w-full rounded-lg bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          <div className="flex justify-between bg-liberty-light-800 text-[whitesmoke] items-center gap-2 py-4 px-4 border-b-[1px] border-liberty-light-400">
            <div className="h-2 bg-gray-200 rounded-full w-[50%] animate-pulse"></div>
            <div className="w-[40%] flex justify-between">
              <div className="h-2 bg-gray-200 rounded-full w-[20%] animate-pulse"></div>
              <div className="h-2 bg-gray-200 rounded-full w-[20%] animate-pulse"></div>
              <div className="h-2 bg-gray-200 rounded-full w-[20%] animate-pulse"></div>
            </div>
          </div>
          <div className="">
            {new Array(5).fill(0).map(() => (
              <div className="flex cursor-pointer hover:bg-liberty-light-300 gap-4 justify-between items-center gap-2 py-4 px-4 border-b-[1px] border-liberty-light-600 last:border-b-0">
                <div className="h-2 bg-gray-400 rounded-full w-[25%] animate-pulse"></div>
                <div className="h-2 bg-gray-400 rounded-full w-[75%] animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
