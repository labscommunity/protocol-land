import { Listbox, Transition } from '@headlessui/react'
import React from 'react'
import { AiOutlineCheck } from 'react-icons/ai'
import { HiOutlineChevronUpDown } from 'react-icons/hi2'
import { LuGitBranchPlus } from 'react-icons/lu'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

import NewBranchModal from './NewBranchModal'

export default function BranchButton() {
  const [branchState, branchActions, selectedRepo, isContributor] = useGlobalStore((state) => [
    state.branchState,
    state.branchActions,
    state.repoCoreState.selectedRepo,
    state.repoCoreActions.isContributor
  ])

  React.useEffect(() => {
    branchActions.listBranches()
    branchActions.getActiveBranch()
  }, [])

  const [isNewBranchModalOpen, setIsNewBranchModalOpen] = React.useState(false)

  const contributor = isContributor()

  return (
    <div className="flex items-center gap-4">
      <Listbox value={branchState.currentBranch} onChange={branchActions.switchBranch}>
        <div className="relative">
          <Listbox.Button className="relative w-full flex gap-16 justify-between items-center cursor-default rounded-lg text-[#4388f6] hover:bg-[#4388f6] hover:text-white border-[1.2px] border-[#4388f6] py-2 px-3 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 text-md font-medium">
            <span className="block truncate">{branchState.currentBranch}</span>
            <HiOutlineChevronUpDown className="h-5 w-5 text-[inherit]" aria-hidden="true" />
          </Listbox.Button>
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 w-[300px] max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none font-medium">
              {branchState.branchList.map((branch, idx) => (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-[#4388f6] text-white' : 'text-liberty-dark-100'
                    }`
                  }
                  value={branch}
                >
                  {({ selected, active }) => (
                    <span>
                      <span
                        className={`flex items-center justify-between hover:text-[white] truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {branch}
                        {branch === selectedRepo?.repo?.defaultBranch && (
                          <span
                            className={`border-[1px] ${
                              active ? 'border-white' : 'border-liberty-dark-100'
                            } rounded-full px-2 text-sm`}
                          >
                            default
                          </span>
                        )}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 ">
                          <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </span>
                  )}
                </Listbox.Option>
              ))}
              <div className="py-2 flex justify-center items-center text-[#4388f6]">
                <span className="cursor-pointer">View all branches</span>
              </div>
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {contributor && (
        <Button onClick={() => setIsNewBranchModalOpen(true)} variant="solid" className="rounded-md !px-4 py-[11px]">
          <LuGitBranchPlus className="w-5 h-5" />
        </Button>
      )}
      <NewBranchModal
        isOpen={isNewBranchModalOpen}
        setIsOpen={setIsNewBranchModalOpen}
        addNewBranch={branchActions.createNewBranch}
      />
    </div>
  )
}
