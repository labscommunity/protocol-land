import { Listbox, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'
import { Fragment } from 'react'
import { IoCheckmark } from 'react-icons/io5'
import { PiCaretDownBold } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'

import { PL_REPO_ID } from '@/helpers/constants'

import { tabs } from './config'

export default function RepoTabs() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Code')

  function handleTabChange(title: string) {
    const tab = tabs.find((t) => t.title === title)
    if (tab) {
      setActiveTab(tab.title)
      const timeout = setTimeout(() => {
        navigate(tab.getPath(PL_REPO_ID))
        clearTimeout(timeout)
      }, 100)
    }
  }

  return (
    <>
      <div className="w-full border-b border-gray-200 justify-start items-start hidden lg:flex">
        {tabs.map((tab, idx) => (
          <div
            key={`tab-${idx}`}
            className={clsx(
              'px-3 py-2 justify-center items-center gap-1.5 flex cursor-pointer hover:bg-gray-100 hover:rounded-md',
              tab.title === activeTab && 'border-b-2 border-blue-400'
            )}
            onClick={() => handleTabChange(tab.title)}
          >
            <tab.Icon className="w-4 h-4" />
            <div className="text-gray-900 text-sm md:text-base font-medium font-inter leading-normal">{tab.title}</div>
          </div>
        ))}
      </div>
      <div className="w-full block lg:hidden">
        <Listbox value={activeTab} onChange={handleTabChange}>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
              <span className="block truncate">{activeTab}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <PiCaretDownBold className="w-4 h-4" />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm md:text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {tabs.map((tab, tabIdx) => (
                  <Listbox.Option
                    key={tabIdx}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-200' : ''}`
                    }
                    value={tab.title}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {tab.title}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
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
    </>
  )
}
