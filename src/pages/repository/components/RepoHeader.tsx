import { AiOutlineFork, AiOutlineStar } from 'react-icons/ai'
import { FaClone } from 'react-icons/fa'
import { FiGitBranch, FiGitCommit, FiHardDrive, FiTag } from 'react-icons/fi'

import { Button } from '@/components/common/buttons'

export default function RepoHeader() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="flex gap-6">
          <div className="bg-white rounded-full w-16 h-16 flex justify-center items-center">
            <h4 className="text-2xl font-bold tracking-wide text-liberty-dark-100">SK</h4>
          </div>
          <div className="">
            <h1 className="text-3xl font-medium text-liberty-dark-100">test-repo</h1>
            <p className="text-liberty-dark-50">Transaction ID: 6b8LM0isavaM8whlvx2u5BwA-ZaK65ZJu2MuMT7DSI8</p>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4">
          <Button className="rounded-[20px] py-[7px] flex gap-1 items-center" variant="outline">
            <AiOutlineStar className="h-6 w-6" />
            <span className="font-medium">10</span>
          </Button>
          <Button className="rounded-[20px] flex gap-2 items-center" variant="solid">
            <AiOutlineFork className="h-6 w-6" />
            Fork
          </Button>
          <Button className="rounded-[20px] flex gap-2 items-center" variant="solid">
            <FaClone className="h-5 w-5" />
            Clone
          </Button>
        </div>
      </div>
      <div className="flex gap-4 items-center text-liberty-dark-100">
        <div className="flex gap-2 items-center">
          <FiGitCommit className="h-5 w-5" />
          <p>
            <span className="font-medium">100</span> Commit
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <FiGitBranch className="h-5 w-5" />
          <p>
            <span className="font-medium">100</span> Branches
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <FiTag className="h-5 w-5" />
          <p>
            <span className="font-medium">100</span> Tags
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <FiHardDrive className="h-5 w-5" />
          <p>
            <span className="font-medium">1.1 MB</span> Files
          </p>
        </div>
      </div>
      <div>
        <p className='text-liberty-dark-100'>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita eum quos sapiente ad autem, doloribus, iure
          hic obcaecati veniam at non id corporis? At magni aut amet voluptate pariatur ducimus!
        </p>
      </div>
    </div>
  )
}
