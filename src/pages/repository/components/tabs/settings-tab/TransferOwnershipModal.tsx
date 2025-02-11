import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import React, { Fragment } from 'react'
import toast from 'react-hot-toast'
import SVG from 'react-inlinesvg'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

type TransferOwnershipModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
}

export default function TransferOwnershipModal({ setIsOpen, isOpen }: TransferOwnershipModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [address, setAddress] = React.useState('')
  const [error, setError] = React.useState('')
  const [transferOwnership, transferOwnershipToOrganization] = useGlobalStore((state) => [
    state.repoCoreActions.transferOwnership,
    state.repoCoreActions.transferOwnershipToOrganization
  ])

  function closeModal() {
    setIsOpen(false)
    setAddress('')
    setError('')
    setIsSubmitting(false)
  }

  async function handleTransferOwnership() {
    setError('')

    if (!address) {
      setError('Address / ID is required')
      return
    }

    const arweaveAddressPattern = /^[a-zA-Z0-9_-]{43}$/

    setIsSubmitting(true)
    try {
      if (arweaveAddressPattern.test(address)) {
        await transferOwnership(address)
      } else {
        await transferOwnershipToOrganization(address)
      }
      closeModal()
    } catch (error) {
      setError('Failed to transfer ownership')
      toast.error('Failed to transfer ownership')
    } finally {
      setIsSubmitting(false)
    }
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
              <Dialog.Panel className="w-full max-w-md transform rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* <NewRepoModalTabs /> */}

                <div className="w-full flex justify-between align-middle">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    Transfer Ownership
                  </Dialog.Title>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                </div>
                <div className="mt-4 flex flex-col gap-2.5">
                  <div className="flex flex-col gap-3">
                    <div className="mb-1 flex flex-col gap-1">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-600">
                        Address / Organization ID *
                      </label>
                      <span className="text-xs text-gray-500">
                        You can enter Arweave Wallet Address or a new owner or Organization ID or Organization Username
                      </span>
                    </div>

                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={clsx(
                        'bg-white text-sm border-[1px] h-10 text-gray-900 rounded-md hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none placeholder:text-sm',
                        'border-gray-300'
                      )}
                      placeholder="Enter Arweave address or organization ID / Username"
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full justify-center font-medium h-10 !text-sm"
                    onClick={handleTransferOwnership}
                    variant="primary-solid"
                  >
                    Transfer Ownership
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
