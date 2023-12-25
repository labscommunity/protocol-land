import { Listbox, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { HiChevronUpDown } from 'react-icons/hi2'
import { IoCheckmark } from 'react-icons/io5'

import { Button } from '@/components/common/buttons'
import DragonDeploy from '@/components/DragonDeploy/DragonDeploy'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

export default function Deployments() {
  const [selectedRepo, branchActions, branchState, isContributor, updateDeploymentBranch] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.branchActions,
    state.branchState,
    state.repoCoreActions.isContributor,
    state.repoCoreActions.updateRepoDeploymentBranch
  ])
  const defaultBranch = 'None'
  const [branches, setBranches] = useState<string[]>([defaultBranch])
  const [selectedBranch, setSelectedBranch] = useState(branches[0])
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleUpdateButtonClick() {
    if (selectedRepo && selectedBranch !== selectedRepo.deploymentBranch) {
      setIsUpdating(true)
      const { error } = await withAsync(() =>
        updateDeploymentBranch(selectedBranch === defaultBranch ? '' : selectedBranch)
      )
      if (error) {
        toast.success('Failed to update default branch for dragon deploy.')
      } else {
        toast.success('Successfully updated default branch for dragon deploy.')
      }
      setIsUpdating(false)
    }
  }

  const repoContributor = isContributor()

  useEffect(() => {
    branchActions.listBranches()
  }, [])

  useEffect(() => {
    if (branchState.status === 'SUCCESS' && branches.length === 1 && selectedRepo) {
      if (selectedRepo.deploymentBranch) {
        setSelectedBranch(selectedRepo.deploymentBranch)
      }
      setBranches([...branchState.branchList, defaultBranch])
    }
  }, [branchState, selectedRepo])

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full border-b-[1px] border-gray-200 py-1">
        <h1 className="text-2xl text-gray-900">Deployments</h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-md">
            {selectedRepo?.deploymentBranch === ''
              ? 'Dragon Deploy is currently disabled. Set a default branch to enable dragon deploy for this repository.'
              : `Dragon Deploy deployment is currently configured for ${selectedRepo?.deploymentBranch} branch.`}
          </span>
          <div className="w-full">
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
              Select a default branch
            </label>
            <div className="flex items-center gap-4">
              <div className="w-72">
                <Listbox value={selectedBranch} onChange={setSelectedBranch}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                      <span className="block truncate">{selectedBranch}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <HiChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {branches.map((branch, branchIdx) => (
                          <Listbox.Option
                            key={branchIdx}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-primary-100' : 'text-gray-900'
                              }`
                            }
                            value={branch}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {branch}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-700">
                                    <IoCheckmark className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
              <Button
                disabled={
                  isUpdating ||
                  selectedBranch === selectedRepo?.deploymentBranch ||
                  (selectedBranch === defaultBranch && !selectedRepo?.deploymentBranch) ||
                  !repoContributor
                }
                isLoading={isUpdating}
                onClick={handleUpdateButtonClick}
                variant="primary-solid"
              >
                Save
              </Button>
              {repoContributor && <DragonDeploy />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
