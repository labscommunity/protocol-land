import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import SVG from 'react-inlinesvg'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'

import { ERROR_MESSAGE_TYPES, ErrorMessageTypes } from './config'

type NewRepoModalProps = {
  onClose: () => void
  isOpen: boolean
  errorType: ErrorMessageTypes
  onActionClick?: () => void | Promise<void>
}

export default function DecentralizeError({ onClose, isOpen, errorType, onActionClick }: NewRepoModalProps) {
  const { title, description, icon: Icon, actionText } = ERROR_MESSAGE_TYPES[errorType]

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
                    Decentralize Repo
                  </DialogTitle>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                </div>
                <div className="mt-6 flex flex-col gap-2.5">
                  <div className="flex flex-col items-center w-full justify-center gap-2">
                    <Icon className="w-20 h-20 text-red-500" />
                    <div className="flex flex-col items-center w-full justify-center gap-1">
                      <h1 className="text-lg font-medium text-gray-900">{title || 'Error'}</h1>
                      <p className="text-gray-500 text-center leading-[20px]">
                        {description || 'An error occurred while trying to decentralize the repository.'}
                      </p>
                    </div>
                  </div>
                </div>

                {onActionClick && (
                  <div className="mt-6">
                    <Button
                      className="w-full justify-center font-medium"
                      onClick={onActionClick}
                      variant="primary-solid"
                    >
                      {actionText}
                    </Button>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
