import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import SVG from 'react-inlinesvg'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'
import { RepoToken } from '@/types/repository'

type NewRepoModalProps = {
  onClose: () => void
  isOpen: boolean
  token: RepoToken
}

export default function DecentralizeSuccess({ onClose, isOpen, token }: NewRepoModalProps) {
  function closeModal() {
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-[368px] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="w-full flex justify-between align-middle">
                  <DialogTitle as="h3" className="text-xl font-medium text-gray-900">
                    Repository Decentralized
                  </DialogTitle>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                </div>
                <div className="mt-6 flex flex-col gap-2.5">
                  <div className="flex flex-col items-center w-full justify-center">
                    <img src={token.tokenImage} className="w-20 h-20 rounded-full" />
                    <h1 className="text-lg font-medium text-gray-900">
                      {token.tokenName} - {token.tokenTicker}
                    </h1>
                    <p className="text-gray-500 text-center">
                      The repository has been successfully decentralized. A project token has been successfully created.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="w-full justify-center font-medium" onClick={closeModal} variant="primary-solid">
                    Close
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
