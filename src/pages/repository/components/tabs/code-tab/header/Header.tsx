import { AiOutlinePlus } from 'react-icons/ai'

import { Button } from '@/components/common/buttons'

import BranchButton from './BranchButton'

export default function Header() {
  return (
    <div className="flex justify-between">
      <BranchButton />
      <Button className="rounded-lg flex items-center py-[4px] px-4 font-medium gap-1" variant="solid">
        <AiOutlinePlus className="w-5 h-5" /> Add Files
      </Button>
    </div>
  )
}

//   <Button className="rounded-lg flex items-center py-[4px] px-4 font-medium gap-2" variant="outline">
//     <FiGitBranch /> main <FiChevronDown className="h-5 w-5" aria-hidden="true" />
//   </Button>
