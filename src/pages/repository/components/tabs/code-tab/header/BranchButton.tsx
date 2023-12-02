import { Listbox, Transition } from '@headlessui/react'
import React from 'react'
import { AiOutlineCheck } from 'react-icons/ai'
import { FiChevronDown } from 'react-icons/fi'
import { LuGitBranchPlus } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import { rootTabConfig } from '@/pages/repository/config/rootTabConfig'
import { useGlobalStore } from '@/stores/globalStore'

import NewBranchModal from './NewBranchModal'

export default function BranchButton() {
  const navigate = useNavigate()
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

  async function onChange(value: string) {
    const { error } = await withAsync(() => branchActions.switchBranch(value))
    if (!error && selectedRepo.repo?.id) {
      navigate(rootTabConfig[0].getPath(selectedRepo.repo?.id, value))
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Listbox value={branchState.currentBranch} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-[320px] flex justify-between items-center cursor-default rounded-lg bg-white hover:bg-primary-50 hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] text-gray-500 border-[1px] border-gray-300 py-[10px] px-3 text-left focus:outline-none text-md font-medium">
            {({ open }) => (
              <>
                <span className="block truncate">{branchState.currentBranch}</span>
                {open && <FiChevronDown className="ml-2 -mr-1 h-5 w-5 rotate-180" aria-hidden="true" />}
                {!open && <FiChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />}
              </>
            )}
          </Listbox.Button>
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-2 w-full max-h-60 overflow-auto rounded-lg bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:outline-none font-medium border-[1px] border-gray-300">
              {branchState.branchList.map((branch, idx) => (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-[10px] px-4 ${
                      active ? 'bg-primary-50 text-gray-900' : 'text-gray-700'
                    }`
                  }
                  value={branch}
                >
                  {({ selected }) => (
                    <span>
                      <span
                        className={`flex items-center justify-between truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {branch}
                        <span className="flex items-center">
                          {branch === selectedRepo?.repo?.defaultBranch && (
                            <span
                              className={`border-[1px] border-primary-600 text-primary-600 rounded-full px-2 text-sm`}
                            >
                              default
                            </span>
                          )}
                          {selected ? (
                            <span className="flex items-center pl-3 text-primary-600">
                              <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </span>
                  )}
                </Listbox.Option>
              ))}
              <div className="py-4 flex justify-center items-center text-primary-600">
                <span className="cursor-pointer">View all branches</span>
              </div>
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {contributor && (
        <Button
          onClick={() => setIsNewBranchModalOpen(true)}
          variant="primary-solid"
          className="rounded-md !px-4 py-[11px]"
        >
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
