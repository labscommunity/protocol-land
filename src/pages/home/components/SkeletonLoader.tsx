import { FaCodeFork } from 'react-icons/fa6'

import { Button } from '@/components/common/buttons'

export default function SkeletonLoader() {
  return (
    <div className="w-full flex justify-between items-start border border-primary-500 rounded-md p-4">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex gap-2 items-center">
          <div className="h-2 bg-gray-500 rounded-full w-[12%] animate-pulse"></div>
          <span className="text-gray-400">/</span>
          <div className="h-2 bg-gray-500 rounded-full w-[12%] animate-pulse"></div>
        </div>

        <div className="h-2 bg-gray-500 rounded-full w-[40%] animate-pulse"></div>
        <div className="h-2 bg-gray-500 rounded-full w-[60%] animate-pulse"></div>
      </div>
      <Button className="!px-3 !py-0 flex gap-2" variant="primary-outline" disabled>
        <FaCodeFork className="w-[14px] h-[14px]" />
        <span>Fork</span>
        <div className="border h-full pl-2 border-r-0 border-t-0 border-b-0 border-gray-400">
          {Math.floor(Math.random() * 5)}
        </div>
      </Button>
    </div>
  )
}
