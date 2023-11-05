export default function RepoLoading() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex w-full">
        <div className="border-gray-300 border-[1px] w-full rounded-lg bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          <div className="flex justify-between bg-gray-200 items-center gap-2 py-4 px-4 border-b-[1px] border-gray-300">
            <div className="h-2 bg-gray-400 rounded-full w-[50%] animate-pulse"></div>
            <div className="w-[40%] flex justify-between">
              <div className="h-2 bg-gray-400 rounded-full w-[20%] animate-pulse"></div>
              <div className="h-2 bg-gray-400 rounded-full w-[20%] animate-pulse"></div>
              <div className="h-2 bg-gray-400 rounded-full w-[20%] animate-pulse"></div>
            </div>
          </div>
          <div className="">
            {new Array(5).fill(0).map(() => (
              <div className="flex cursor-pointer gap-4 justify-between items-center py-4 px-4 border-b-[1px] border-gray-300 last:border-b-0">
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
