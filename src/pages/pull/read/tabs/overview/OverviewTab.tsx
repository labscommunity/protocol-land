import { AiFillCloseCircle } from 'react-icons/ai'
import { FiGitMerge } from 'react-icons/fi'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

import Sidebar from '../../components/Sidebar'

export default function OverviewTab() {
  const { pullId } = useParams()
  const [selectedRepo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])

  const PR = selectedRepo && selectedRepo.pullRequests[+pullId! - 1]

  return (
    <div className="flex gap-6">
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col border-[1px] border-[#cbc9f6] rounded-lg overflow-hidden">
          <div className="flex font-medium bg-[#5E70AB] px-4 py-2 text-white">Description</div>
          <div className="text-liberty-dark-100 p-2 h-32 bg-white">{PR && PR.description}</div>
        </div>
        <div className="flex w-full py-4 justify-center gap-4">
          <Button className="rounded-full !bg-[#37A457] flex gap-1 items-center" variant="solid">
            <FiGitMerge className="w-4 h-4" />
            Merge
          </Button>
          <Button className="rounded-full bg-red-600 flex gap-1 items-center" variant="solid">
            <AiFillCloseCircle className="w-4 h-4" />
            Close
          </Button>
        </div>
      </div>
      <Sidebar />
    </div>
  )
}
