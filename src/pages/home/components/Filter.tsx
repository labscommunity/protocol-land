import { Popover, Transition } from '@headlessui/react'
import { Dispatch, Fragment, SetStateAction, useState } from 'react'
import { FiFilter } from 'react-icons/fi'

import { Button } from '@/components/common/buttons'
import { Filters } from '@/types/explore'

interface FilterProps {
  selectedFilters: Filters
  setSelectedFilters: Dispatch<SetStateAction<Filters>>
}

export default function Filter({ selectedFilters, setSelectedFilters }: FilterProps) {
  const [filters, setFilters] = useState(selectedFilters)

  function handleClickCheckbox(key: string) {
    setFilters((oldFilters) => ({
      ...oldFilters,
      // @ts-ignore
      [key]: !oldFilters[key]
    }))
  }

  function handleSaveButton() {
    setSelectedFilters(filters)
  }

  function handleCancelButton() {
    setFilters(selectedFilters)
  }

  return (
    <div className="w-full max-w-sm">
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              onClick={() => {
                if (!open) {
                  handleCancelButton()
                }
              }}
              className={`
                ${open ? 'text-white' : 'text-white/90'}
                group inline-flex items-center rounded-md bg-primary-700 p-[5px] text-base font-medium hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
            >
              <FiFilter className="w-[14px] h-[14px]" />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-screen max-w-xs -translate-x-1/2 transform px-4 sm:px-0">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                  <div className="px-7 py-2 font-medium bg-gray-100">Filter By</div>
                  <div className="relative gap-5 flex flex-col bg-white px-7 pb-7 pt-5">
                    {Object.entries(filters).map(([key, value]) => (
                      <div
                        key={key}
                        className="-m-3 gap-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500/50 cursor-pointer"
                        onClick={() => handleClickCheckbox(key)}
                      >
                        <input
                          className="cursor-default w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded"
                          type="checkbox"
                          checked={value}
                          id={key}
                        />

                        <p className="text-sm font-medium text-gray-900">{key}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end px-3 py-2 font-medium bg-gray-100">
                    <Button
                      as={Popover.Button}
                      className="!px-3 !py-1"
                      variant="primary-outline"
                      onClick={handleCancelButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      as={Popover.Button}
                      className="!px-3 !py-1"
                      variant="primary-solid"
                      onClick={() => handleSaveButton()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}
