import { Listbox, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'
import toast from 'react-hot-toast'
import { FiCheck, FiPlus } from 'react-icons/fi'
import { useParams } from 'react-router-dom'

import { useGlobalStore } from '@/stores/globalStore'

export default function ReviewerAdd() {
  const { pullId } = useParams()
  const [reviewers, setReviewers] = React.useState<string[]>([])
  const [repo, addReviewers] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.pullRequestActions.addReviewers
  ])

  const normalizedPrReviewers =
    (repo && repo.pullRequests[+pullId! - 1]?.reviewers.map((reviewer) => reviewer.address)) ?? []
  const contributors = repo && repo.contributors.filter((address) => normalizedPrReviewers.indexOf(address) < 0)

  async function handleReviwersSubmit() {
    //
    if (reviewers.length > 0 && pullId) {
      await addReviewers(+pullId, reviewers)
      toast.success('Successfully added reviewers')
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
                        active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                      }`
                    }
                    value={address}
                  >
                    {({ selected }) => {
                      return (
                        <>
                          <span
                            className={`flex gap-2 items-center truncate text-liberty-dark-100 ${
                              selected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            <FiCheck
                              className={`min-w-[16px] h-4 ${
                                reviewers.indexOf(address) > -1 ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            {address}
                          </span>
                        </>
                      )
                    }}
                  </Listbox.Option>
                ))}
              {reviewers.length > 0 && (
                <div className="p-2 mt-1 flex">
                  <span
                    onClick={handleReviwersSubmit}
                    className="cursor-pointer w-full text-center font-medium text-white rounded-full bg-[#4388f6] py-[6px] px-2"
                  >
                    Submit
                  </span>
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
