import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import SVG from 'react-inlinesvg'

import ArConnectLogo from '../../assets/arconnect-logo.svg'
import OthentLogo from '../../assets/othent-logo.svg'

type LoginModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
}

export default function LoginModal({ setIsOpen, isOpen }: LoginModalProps) {
  function closeModal() {
    setIsOpen(false)
  }

  return (
    <>
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
            <div className="fixed inset-0 bg-[rgba(23,29,37,0.5)] blur-xl" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[rgba(38,38,44,1)] p-6 text-left align-middle shadow-xl transition-all">
                  <div className="w-full flex justify-between align-middle">
                    <Dialog.Title as="h2" className="text-2xl font-medium leading-6 text-[whitesmoke]">
                      Connect with your account
                    </Dialog.Title>
                    <AiFillCloseCircle onClick={closeModal} className="h-6 w-6 text-white cursor-pointer" />
                  </div>
                  <div className="flex flex-col mt-10 gap-4">
                    <div className="cursor-pointer w-full rounded-md bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px]">
                      <div className="p-3 flex gap-2 rounded-md h-full w-full items-center justify-center bg-[rgba(38,38,44,1)] back">
                        <SVG src={ArConnectLogo} width={24} height={24} />
                        <h1 className="text-xl text-[whitesmoke] font-medium">ArConnect</h1>
                      </div>
                    </div>
                    <div className="cursor-pointer w-full rounded-md bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px]">
                      <div className="p-3 flex gap-2 rounded-md h-full w-full items-center justify-center bg-[rgba(38,38,44,1)] back">
                        <SVG src={OthentLogo} width={24} height={24} />
                        <h1 className="text-xl text-[whitesmoke]">Othent</h1>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
