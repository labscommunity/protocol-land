import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import React, { ChangeEvent, Fragment } from 'react'
import toast from 'react-hot-toast'
import SVG from 'react-inlinesvg'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

type NewRepoModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
}

export default function InvitePeopleModal({ setIsOpen, isOpen }: NewRepoModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [role, setRole] = React.useState('ADMIN')
  const [address, setAddress] = React.useState('')
  const [error, setError] = React.useState('')
  const [selectedOrganization, inviteMember] = useGlobalStore((state) => [
    state.organizationState.selectedOrganization,
    state.organizationActions.inviteMember
  ])

  function closeModal() {
    setIsOpen(false)
  }

  async function handleInvite() {
    if (!selectedOrganization || !selectedOrganization.organization) {
      toast.error('Failed to invite member')
      return
    }

    setError('')

    if (!address) {
      setError('Address is required')
      return
    }

    const arweaveAddressPattern = /^[a-zA-Z0-9_-]{43}$/
    if (!arweaveAddressPattern.test(address)) {
      setError('Invalid Arweave address format')
      return
    }
    setIsSubmitting(true)
    const res = await inviteMember(selectedOrganization.organization.id, address, role)

    if (!res) {
      setIsSubmitting(false)
      toast.error('Failed to invite member')
      return
    }

    toast.success('Member invited successfully')
    closeModal()

    setIsSubmitting(false)
    console.log({ role, address })
  }

  function handleRoleChange(event: ChangeEvent<HTMLInputElement>) {
    setRole(event.target.value)
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
                    Invite a new member
                  </Dialog.Title>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                </div>
                <div className="mt-4 flex flex-col gap-2.5">
                  <div>
                    <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={clsx(
                        'bg-white text-sm border-[1px] h-10 text-gray-900 rounded-md hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none placeholder:text-sm',
                        'border-gray-300'
                      )}
                      placeholder="Enter Arweave address"
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                  </div>

                  <div className="flex flex-col">
                    <h1 className="mb-1 text-sm font-medium text-gray-600">Role</h1>
                    <div className="flex flex-row gap-2">
                      <label htmlFor="radio-1" className="flex items-center text-sm font-medium">
                        <input
                          type="radio"
                          name="radio-group"
                          onChange={handleRoleChange}
                          value="ADMIN"
                          defaultChecked
                          className="mr-2 text-sm rounded-full h-4 w-4 checked:accent-primary-700 accent-primary-600 bg-white focus:ring-primary-600  outline-none"
                        />
                        Admin
                      </label>
                      <label htmlFor="radio-2" className="flex items-center text-sm font-medium">
                        <input
                          type="radio"
                          name="radio-group"
                          onChange={handleRoleChange}
                          value="MEMBER"
                          className="mr-2 text-sm rounded-full h-4 w-4 checked:accent-primary-700 accent-primary-600 bg-white focus:ring-primary-600  outline-none"
                        />
                        Member
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full justify-center font-medium h-10 !text-sm"
                    onClick={handleInvite}
                    variant="primary-solid"
                  >
                    Invite Member
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
