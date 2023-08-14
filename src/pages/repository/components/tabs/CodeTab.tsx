import React from 'react'
import { AiFillFolder, AiOutlineFileText, AiOutlinePlus } from 'react-icons/ai'
import { FiChevronDown, FiGitBranch } from 'react-icons/fi'

import { Button } from '@/components/common/buttons'

export default function CodeTab() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between">
        <Button className="rounded-lg flex items-center py-[4px] px-4 font-medium gap-2" variant="outline">
          <FiGitBranch /> main <FiChevronDown className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button className="rounded-lg flex items-center py-[4px] px-4 font-medium gap-1" variant="solid">
          <AiOutlinePlus className="w-5 h-5" /> Add Files
        </Button>
      </div>
      <div className="flex w-full">
        <div className="border-[#e3e2ff] border-[1.5px] w-full rounded-lg bg-[#414E7A] text-white overflow-hidden">
          <div className="flex hover:bg-liberty-light-600 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-400">
            <AiFillFolder className="w-5 h-5" /> <span>assets</span>
          </div>
          <div className="flex hover:bg-liberty-light-600 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-400">
            <AiFillFolder className="w-5 h-5" />
            src
          </div>
          <div className="flex hover:bg-liberty-light-600 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-400">
            <AiOutlineFileText className="w-5 h-5" /> .gitignore
          </div>
          <div className="flex hover:bg-liberty-light-600 items-center gap-2 py-2 px-4">
            <AiOutlineFileText className="w-5 h-5" /> Cargo.lock
          </div>
        </div>
      </div>
    </div>
  )
}
