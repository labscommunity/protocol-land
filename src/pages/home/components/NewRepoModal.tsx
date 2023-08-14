import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'

import { Button } from '@/components/common/buttons'

type NewRepoModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
}

export default function NewRepoModal({ setIsOpen, isOpen }: NewRepoModalProps) {
  function closeModal() {
    setIsOpen(false)
  }

  function handleCreateBtnClick() {
    //
  }

  return (
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="w-full flex justify-between align-middle">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-liberty-dark-100">
                    Create a new Repository
                  </Dialog.Title>
                  <AiFillCloseCircle onClick={closeModal} className="h-6 w-6 text-liberty-dark-100 cursor-pointer" />
                </div>
                <div className="mt-2 flex flex-col gap-2.5">
                  <div>
                    <label htmlFor="title" className="block mb-1 text-md font-medium text-liberty-dark-100">
                      Title
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      className="bg-gray-50 border border-gray-300 text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5"
                      placeholder="my-cool-repo"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block mb-1 text-md font-medium text-liberty-dark-100">
                      Description
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      className="bg-gray-50 border border-gray-300 text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5"
                      placeholder="A really cool repo fully decentralized"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button className="rounded-md" onClick={handleCreateBtnClick} variant="solid">
                    Create
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
