import { Popover, Transition } from '@headlessui/react'
import { Dispatch, Fragment, SetStateAction } from 'react'
import { FiFilter } from 'react-icons/fi'

import { Filters } from '@/types/explore'

interface FilterProps {
  selectedFilters: Filters
  setSelectedFilters: Dispatch<SetStateAction<Filters>>
}

export default function Filter({ selectedFilters, setSelectedFilters }: FilterProps) {
  function handleClickCheckbox(key: string) {
    setSelectedFilters((oldFilters) => ({
      ...oldFilters,
      // @ts-ignore
      [key]: !oldFilters[key]
    }))
  }

  return (
    <div className="w-full max-w-sm px-4">
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              className={`
                ${open ? 'text-white' : 'text-white/90'}
                group inline-flex items-center rounded-md bg-primary-700 px-3 py-2 text-base font-medium hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
            >
              <FiFilter />
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
                  <div className="px-7 py-2 font-medium bg-gray-100">Filter</div>
                  <div className="relative gap-5 flex flex-col bg-white px-7 pb-7 pt-5">
                    {Object.entries(selectedFilters).map(([key, value]) => (
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
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}
