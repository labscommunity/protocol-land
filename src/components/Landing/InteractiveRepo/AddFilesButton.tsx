import { Transition } from '@headlessui/react'
import { Menu } from '@headlessui/react'
import { Fragment } from 'react'
import { FiPlus, FiUpload } from 'react-icons/fi'
import { PiCaretDownBold } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'

import { PL_REPO_ID } from '@/helpers/constants'

import { tabs } from './config'

export default function AddFilesButton() {
  const navigate = useNavigate()

  function handleClick() {
    navigate(tabs[0].getPath(PL_REPO_ID))
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="px-3 py-2 bg-primary-800 hover:bg-primary-900 rounded-md shadow justify-center items-center gap-1.5 flex">
          <div className="text-white text-sm md:text-base font-medium font-inter leading-normal">Add File</div>
          <div className="w-4 h-4">
            <PiCaretDownBold className="text-white w-full h-full" />
          </div>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 md:right-0 mt-2 w-40 md:w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleClick}
                  className={`${
                    active ? 'bg-gray-200' : ''
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                >
                  <FiPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Create new file
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleClick}
                  className={`${
                    active ? 'bg-gray-200' : ''
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                >
                  <FiUpload className="mr-2 h-5 w-5" aria-hidden="true" />
                  Upload files
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
