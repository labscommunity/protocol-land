import { Dialog, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React, { Fragment } from 'react'
import { useForm } from 'react-hook-form'
import { AiFillCloseCircle } from 'react-icons/ai'
import SVG from 'react-inlinesvg'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'

import ArweaveLogo from '@/assets/arweave.svg'
import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

type NewBountyModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
}

const schema = yup
  .object({
    amount: yup
      .number()
      .positive('Amount must be greater than 0')
      .typeError('Invalid amount')
      .required('Amount is required'),
    expiry: yup
      .date()
      .min(new Date(), 'Expiry must be in the future')
      .typeError('Invalid expiry date')
      .required('Expiry is required')
  })
  .required()

export default function NewBountyModal({ isOpen, setIsOpen }: NewBountyModalProps) {
  const { issueId } = useParams()
  const [addBounty] = useGlobalStore((state) => [state.issuesActions.addBounty])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  async function handleAddButtonClick(data: yup.InferType<typeof schema>) {
    setIsSubmitting(true)

    const unixTimestampOfExpiry = Math.floor(data.expiry.getTime() / 1000)

    await addBounty(+issueId!, data.amount, unixTimestampOfExpiry)
    
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
                    Add bounty
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
                        {...register('amount')}
                        className={clsx(
                          'bg-gray-50 border pr-12 text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                          errors.amount ? 'border-red-500' : 'border-gray-300'
                        )}
                        step="0.5"
                        type="number"
                        placeholder="2"
                        min={'0'}
                      />
                      <div className="h-full absolute right-4 top-0 flex items-center">
                        <span className="font-medium text-liberty-dark-100">AR</span>
                      </div>
                    </div>
                    {errors.amount && <p className="text-red-500 text-sm italic mt-2">{errors.amount.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="expiry" className="block mb-1 text-md font-medium text-liberty-dark-100">
                      Expiry
                    </label>
                    <div className="flex items-center">
                      <input
                        {...register('expiry')}
                        className={clsx(
                          'bg-gray-50 border text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                          errors.expiry ? 'border-red-500' : 'border-gray-300'
                        )}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        placeholder="2"
                      />
                    </div>
                    {errors.expiry && <p className="text-red-500 text-sm italic mt-2">{errors.expiry.message}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  {isSubmitting && (
                    <Button
                      variant="solid"
                      className="mt-4 flex items-center !px-4 rounded-md cursor-not-allowed"
                      disabled
                    >
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </Button>
                  )}
                  {!isSubmitting && (
                    <Button
                      disabled={Object.keys(errors).length > 0}
                      className="rounded-md disabled:bg-opacity-[0.7]"
                      onClick={handleSubmit(handleAddButtonClick)}
                      variant="solid"
                    >
                      Add
                    </Button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
