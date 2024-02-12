import { Dialog, Tab, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'
import { Fragment } from 'react'
import SVG from 'react-inlinesvg'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'

import ArNSAdd from './ArNSAdd'
import ArNSRegister from './ArNSRegister'

export default function ArNSRegisterModal() {
  const [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <Button variant="primary-solid" onClick={openModal}>
        Setup ArNS
      </Button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="w-full flex justify-between align-middle">
                    <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
                      Setup ArNS
                    </Dialog.Title>
                    <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                  </div>
                  <Dialog.Description className="mt-4">
                    <Tab.Group>
                      <Tab.List className="flex space-x-1 rounded-xl bg-primary-600 p-1">
                        {['Register', 'Add'].map((category) => (
                          <Tab
                            key={category}
                            className={({ selected }) =>
                              clsx(
                                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                'focus:outline-none',
                                selected
                                  ? 'bg-white text-primary-700 shadow'
                                  : 'text-primary-100 hover:bg-white/[0.12] hover:text-white'
                              )
                            }
                          >
                            {category}
                          </Tab>
                        ))}
                      </Tab.List>
                      <Tab.Panels className="mt-2">
                        <Tab.Panel
                          key="register"
                          className={clsx(
                            'rounded-xl bg-white p-3',
                            'ring-white/60 ring-offset-2 ring-offset-primary-400'
                          )}
                        >
                          <ArNSRegister closeModal={closeModal} />
                        </Tab.Panel>
                        <Tab.Panel
                          key="select"
                          className={clsx(
                            'rounded-xl bg-white p-3',
                            'ring-white/60 ring-offset-2 ring-offset-primary-400'
                          )}
                        >
                          <ArNSAdd closeModal={closeModal} />
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  </Dialog.Description>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
