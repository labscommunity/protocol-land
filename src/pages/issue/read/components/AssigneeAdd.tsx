import { Listbox, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'
import toast from 'react-hot-toast'
import { FiCheck, FiPlus } from 'react-icons/fi'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

export default function AssigneeAdd() {
  const { issueId } = useParams()
  const [isLoading, setIsLoading] = React.useState(false)
  const [assignees, setAssignees] = React.useState<string[]>([])
  const [addAssignee, getAssigneesList] = useGlobalStore((state) => [
    state.issuesActions.addAssignee,
    state.issuesActions.getAssigneesList
  ])

  const contributors = getAssigneesList(+issueId!)

  async function handleReviwersSubmit() {
    //
    if (assignees.length > 0 && issueId) {
      setIsLoading(true)

      await addAssignee(+issueId, assignees)
      setAssignees([])
      toast.success('Successfully added assignees')

      setIsLoading(false)
    }
  }

  return (
    <div>
      <Listbox value={assignees} onChange={(vals: any) => setAssignees(vals)} multiple>
        <div className="relative mt-1">
          <Listbox.Button className="relative cursor-default">
            <FiPlus className="h-5 w-5 cursor-pointer" />
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute mt-1 max-h-60 w-56 right-0 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {contributors &&
                contributors.map((address, idx) => (
                  <Listbox.Option
                    key={idx}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-2 pr-4 ${
                        active ? 'bg-primary-100 font-medium' : 'text-gray-900'
                      }`
                    }
                    value={address}
                  >
                    {({ selected }) => {
                      return (
                        <>
                          <span
                            className={`flex gap-2 items-center truncate text-gray-900 ${
                              selected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            <FiCheck
                              className={`min-w-[16px] h-4 ${
                                assignees.indexOf(address) > -1 ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            {address}
                          </span>
                        </>
                      )
                    }}
                  </Listbox.Option>
                ))}
              {contributors && contributors.length > 0 && assignees.length > 0 && (
                <div className="p-2 mt-1 flex">
                  <Button
                    onClick={handleReviwersSubmit}
                    className="w-full justify-center font-medium !py-[6px]"
                    variant="primary-solid"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing' : 'Submit'}
                  </Button>
                </div>
              )}
              {contributors && contributors.length === 0 && (
                <div className="py-2 pl-10 pr-4">
                  <span className="font-medium">No contributors</span>
                </div>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}
