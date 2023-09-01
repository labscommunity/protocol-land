export default function TableHeader() {
  return (
    <div className="rounded-t-lg flex justify-between bg-liberty-light-800 text-[whitesmoke] items-center gap-2 py-2 px-4">
      <div className="flex items-center">
        <span className="font-medium px-4 py-1 rounded-full hover:bg-[#4487F5] cursor-pointer">Open</span>
        <span className="font-medium px-4 py-1 rounded-full hover:bg-[#4487F5] cursor-pointer">Closed</span>
      </div>
      <div className=" cursor-pointer flex items-center bg-[#38a457] rounded-full gap-1 font-medium px-4 py-1">
        <span className="text-white">New pull request</span>
      </div>
    </div>
  )
}
