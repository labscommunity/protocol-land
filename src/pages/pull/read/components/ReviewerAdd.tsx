import { Listbox, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'
import toast from 'react-hot-toast'
import { FiCheck, FiPlus } from 'react-icons/fi'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { shortenAddress } from '@/helpers/shortenAddress'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

export default function ReviewerAdd() {
  const [isLoading, setIsLoading] = React.useState(false)
  const { pullId } = useParams()
  const [reviewers, setReviewers] = React.useState<string[]>([])
  const [addReviewers, getReviewersList] = useGlobalStore((state) => [
    state.pullRequestActions.addReviewers,
    state.pullRequestActions.getReviewersList
  ])

  const contributors = getReviewersList(+pullId!)

  async function handleReviwersSubmit() {
    //
    if (reviewers.length > 0 && pullId) {
      setIsLoading(true)

      const { error } = await withAsync(() => addReviewers(+pullId, reviewers))

      if (error) {
        toast.error('Failed to add reviewers')
      } else {
        setReviewers([])
        toast.success('Successfully added reviewers')
      }

      setIsLoading(false)
    }
  }

  return (
    <div>
      <Listbox value={reviewers} onChange={(vals: any) => setReviewers(vals)} multiple>
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
                        active ? 'bg-primary-100 text-gray-900' : 'text-gray-900'
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
                                reviewers.indexOf(address) > -1 ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            {shortenAddress(address, 6)}
                          </span>
                        </>
                      )
                    }}
                  </Listbox.Option>
                ))}
              {contributors && contributors.length > 0 && reviewers.length > 0 && (
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
