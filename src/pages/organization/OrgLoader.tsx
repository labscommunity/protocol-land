export default function OrganizationPage() {
  return (
    <div className="h-full flex-1 flex flex-col max-w-[1280px] px-8 mx-auto w-full mb-6 gap-2">
      <header className="border-b border-gray-300">
        <div className="container mx-auto py-6 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="relative flex shrink-0 overflow-hidden rounded-full h-20 w-20 animate-pulse bg-gray-300" />
            <div className="flex flex-col gap-2">
              <div className="animate-pulse bg-gray-300 h-3 w-60 rounded-md" />
              {/* <h1 className="text-2xl font-bold flex items-center gap-2">
                Protocol Labs
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-gray-200 text-gray-800">
                  Public
                </div>
              </h1> */}
              <div className="animate-pulse bg-gray-300 h-3 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto py-6 px-4">
        <div className="">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 py-4">
                <div className="h-8 w-24 animate-pulse bg-gray-300 rounded-md" />
                <div className="h-8 w-24 animate-pulse bg-gray-300 rounded-md" />
                <div className="h-8 w-24 animate-pulse bg-gray-300 rounded-md" />
                <div className="h-8 w-24 animate-pulse bg-gray-300 rounded-md" />
              </div>
              <div className="h-9 w-24 animate-pulse bg-gray-300 rounded-md" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border shadow-sm h-[200px]">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="h-2 bg-gray-300 rounded-full w-[40%] animate-pulse"></div>
          </div>
          <div className="flex flex-col gap-2 p-6">
            <div className="h-2 bg-gray-300 rounded-full w-[40%] animate-pulse"></div>
            <div className="h-2 bg-gray-300 rounded-full w-[40%] animate-pulse"></div>
            <div className="h-2 bg-gray-300 rounded-full w-[40%] animate-pulse"></div>
          </div>
          <div className="flex flex-col gap-2 p-6">
            <div className="h-2 bg-gray-300 rounded-full w-[40%] animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="mt-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <div className="h-5 w-32 animate-pulse bg-gray-300 rounded-md" />
              <div className="h-4 w-full max-w-lg animate-pulse bg-gray-300 rounded-md" />
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-pulse bg-gray-300 rounded-md" />
                  <div className="h-4 w-12 animate-pulse bg-gray-300 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-pulse bg-gray-300 rounded-md" />
                  <div className="h-4 w-12 animate-pulse bg-gray-300 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
