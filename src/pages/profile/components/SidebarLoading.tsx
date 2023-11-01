export default function SidebarLoading() {
  return (
    <div className="flex flex-col w-[296px] gap-4">
      <div className="h-[296px] bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-3 animate-pulse"></div>

      <div className="flex flex-col">
        <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-3 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-3 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-3 animate-pulse"></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center text-liberty-dark-100 text-lg">
          {/* <TiLocation className="w-5 h-5" /> */}
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full animate-pulse"></div>
        </div>
        <div className="flex gap-2 items-center text-liberty-dark-100 text-lg">
          {/* <AiOutlineTwitter className="w-5 h-5" /> */}
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full animate-pulse"></div>
        </div>
        <div className="flex gap-2 items-center text-liberty-dark-100 text-lg">
          {/* <AiTwotoneMail className="w-5 h-5" /> */}
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full animate-pulse"></div>
        </div>
        <div className="flex gap-2 items-center text-liberty-dark-100 text-lg">
          {/* <BsGlobe className="w-5 h-5" /> */}
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
