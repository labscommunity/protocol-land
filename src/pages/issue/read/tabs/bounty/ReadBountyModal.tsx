import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { differenceInDays } from 'date-fns'
import React, { Fragment } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import SVG from 'react-inlinesvg'
import { useParams } from 'react-router-dom'

import ArweaveLogo from '@/assets/arweave.svg'
import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'
import { Bounty } from '@/types/repository'

type NewBountyModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
  bounty: Bounty
  author: string
}

export default function ReadBountyModal({ isOpen, setIsOpen, bounty, author }: NewBountyModalProps) {
  const [bountyComplete, setBountyComplete] = React.useState(false)
  const [payTxId, setPayTxId] = React.useState('')
  const { issueId } = useParams()
  const [address, closeBounty, completeBounty] = useGlobalStore((state) => [
    state.authState.address,
    state.issuesActions.closeBounty,
    state.issuesActions.completeBounty
  ])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleCloseButtonClick() {
    setIsSubmitting(true)

    if (bountyComplete && payTxId.length > 0) {
      await completeBounty(+issueId!, bounty.id, payTxId)
    } else {
      await closeBounty(+issueId!, bounty.id)
    }

    setIsSubmitting(false)
    closeModal()
  }

  function closeModal() {
    setIsOpen(false)
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
                    Reward#{bounty.id}
                  </Dialog.Title>
                  <AiFillCloseCircle onClick={closeModal} className="h-6 w-6 text-liberty-dark-100 cursor-pointer" />
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="token" className="block mb-1 text-md font-medium text-liberty-dark-100">
                      Token
                    </label>
                    <div className="flex gap-2 items-center text-liberty-dark-100 font-medium">
                      <SVG
                        src={ArweaveLogo}
                        className="w-5 h-5 [&>circle]:stroke-liberty-dark-100 [&>circle]:stroke-[2.5] [&>circle]:fill-none [&>path]:fill-liberty-dark-100"
                      />
                      <span>Arweave</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="amount" className="block mb-1 text-md font-medium text-liberty-dark-100">
                      Amount
                    </label>
                    <div className="relative flex items-center">
                      <input
                        className={clsx(
                          'bg-gray-50 border pr-12 text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                          'border-gray-300'
                        )}
                        value={bounty.amount}
                        type="number"
                        disabled
                      />
                      <div className="h-full absolute right-4 top-0 flex items-center">
                        <span className="font-medium text-liberty-dark-100">AR</span>
                      </div>
                    </div>
                  </div>
                  {bounty.status === 'ACTIVE' && (
                    <div>
                      <label htmlFor="expiry" className="block mb-1 text-md font-medium text-liberty-dark-100">
                        Expires in
                      </label>

                      <div className="font-medium text-liberty-dark-100">
                        {differenceInDays(new Date(bounty.expiry * 1000), new Date())} Days
                      </div>
                    </div>
                  )}
                </div>

                {author === address && bounty.status === 'ACTIVE' && (
                  <div className="mt-4 flex flex-col gap-4">
                    <div className="text-liberty-dark-100 flex items-center gap-2">
                      <input
                        // className="relative float-left -ml-[1.5rem] mr-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                        type="checkbox"
                        className="h-4 w-4"
                        value=""
                        id="checkboxChecked"
                        onChange={(evt) => setBountyComplete(evt.target.checked)}
                      />
                      Mark this bounty complete?
                    </div>
                    {bountyComplete && (
                      <div>
                        <input
                          className={clsx(
                            'bg-gray-50 border pr-12 text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                            'border-gray-300'
                          )}
                          type="text"
                          placeholder="Payment TX ID"
                          onChange={(evt) => setPayTxId(evt.target.value)}
                        />
                      </div>
                    )}
                    <div className="flex w-full gap-4">
                      <Button
                        disabled={(bountyComplete && payTxId.length === 0) || isSubmitting}
                        className="rounded-md bg-red-600 disabled:bg-opacity-[0.7] w-full flex items-center"
                        onClick={handleCloseButtonClick}
                        variant="solid"
                        isLoading={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Close Bounty'}
                      </Button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
