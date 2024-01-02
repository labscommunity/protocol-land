import { Menu, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'
import { FiChevronDown, FiPlus, FiUpload } from 'react-icons/fi'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

import AddFilesModal from './AddFilesModal'

export default function AddFilesButton() {
  const [isContributor, setIsCreateNewFile] = useGlobalStore((state) => [
    state.repoCoreActions.isContributor,
    state.repoCoreActions.git.setIsCreateNewFile
  ])
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = React.useState(false)

  const contributor = isContributor()

  if (!contributor) return null

  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Button as={Menu.Button} variant="primary-solid">
            Add file
            <FiChevronDown className="-mr-1 ml-2 h-5 w-5 text-primary-200 hover:text-primary-100" aria-hidden="true" />
          </Button>
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
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="px-1 py-1 ">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsCreateNewFile(true)}
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
                    onClick={() => {
                      setIsCreateNewFile(false)
                      setIsAddFilesModalOpen(true)
                    }}
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
      <AddFilesModal isOpen={isAddFilesModalOpen} setIsOpen={setIsAddFilesModalOpen} />
    </div>
  )
}
