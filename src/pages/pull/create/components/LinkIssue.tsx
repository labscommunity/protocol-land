import { Combobox, Transition } from '@headlessui/react'
import { Dispatch, Fragment, SetStateAction, useMemo, useState } from 'react'
import { HiChevronUpDown } from 'react-icons/hi2'
import { IoMdCheckmark } from 'react-icons/io'

import { Issue } from '@/types/repository'

interface LinkIssueProps {
  disabled?: boolean
  issues: Issue[]
  selected: Issue | undefined
  setSelected: Dispatch<SetStateAction<Issue | undefined>>
}

export default function LinkIssue({ issues, selected, disabled, setSelected }: LinkIssueProps) {
  const [query, setQuery] = useState('')

  const filteredIssues = useMemo(
    () =>
      query === ''
        ? issues
        : issues.filter((issue) =>
            issue.title.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
          ),
    [query]
  )

  return (
    <div className="w-full">
      <Combobox value={selected} onChange={setSelected} disabled={disabled} nullable>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm">
            <Combobox.Input
              className="w-full rounded-lg border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(issue: Issue) => (issue ? `#${issue.id} ${issue.title}` : '')}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <HiChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {filteredIssues.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">No Issue found.</div>
              ) : (
                filteredIssues.map((issue) => (
                  <Combobox.Option
                    key={issue.id}
                    className={({ active }) =>
                      `relative select-none py-2 pl-10 pr-4 cursor-pointer ${
                        active ? 'bg-primary-100' : 'text-gray-900'
                      }`
                    }
                    value={issue}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {`#${issue.id} ${issue.title}`}
                        </span>
                        {selected ? (
                          <span className={`absolute inset-y-0 left-0 flex items-center pl-3 text-primary-700`}>
                            <IoMdCheckmark className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
}
