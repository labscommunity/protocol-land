import { Dialog, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React, { Fragment } from 'react'
import { useForm } from 'react-hook-form'
import SVG from 'react-inlinesvg'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'

import ArweaveLogo from '@/assets/arweave.svg'
import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'
import { BountyBase } from '@/types/repository'

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
  const [base, setBase] = React.useState<BountyBase>('AR')
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

    await addBounty(+issueId!, data.amount, unixTimestampOfExpiry, base)

    setIsSubmitting(false)

    closeModal()
  }

  function closeModal() {
    setIsOpen(false)
  }

  function handleBaseChange(newBase: BountyBase) {
    setBase(newBase)
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
              <Dialog.Panel className="w-full max-w-[368px] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="w-full flex justify-between align-middle">
                  <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
                    Add bounty
                  </Dialog.Title>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                </div>
                <div className="mt-6 flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="token" className="block mb-1 text-sm font-medium text-gray-600">
                      Token
                    </label>
                    <div className="flex gap-2 items-center text-gray-900 font-medium">
                      <SVG
                        src={ArweaveLogo}
                        className="w-5 h-5 [&>circle]:stroke-gray-900 [&>circle]:stroke-[2.5] [&>circle]:fill-none [&>path]:fill-gray-900"
                      />
                      <span>Arweave</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-600">
                      Base
                    </label>
                    <div className="flex items-center p-1 bg-gray-100 border-[1px] border-gray-300 rounded-lg gap-1 h-10 order-1">
                      <div
                        onClick={() => handleBaseChange('AR')}
                        className={clsx(
                          'cursor-pointer text-gray-700 w-1/2 h-full flex items-center justify-center font-semibold',
                          {
                            'px-2': base !== 'AR',
                            'px-3 bg-primary-600 text-white rounded-md': base === 'AR'
                          }
                        )}
                      >
                        AR
                      </div>
                      <div
                        onClick={() => handleBaseChange('USD')}
                        className={clsx(
                          'cursor-pointer text-gray-700  w-1/2 h-full flex items-center justify-center font-semibold',
                          {
                            'px-2': base === 'AR',
                            'px-3 bg-primary-600 text-white rounded-md': base !== 'AR'
                          }
                        )}
                      >
                        USD
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-600">
                      Amount
                    </label>
                    <div className="relative flex items-center">
                      <input
                        {...register('amount')}
                        className={clsx(
                          'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                          errors.amount ? 'border-red-500' : 'border-gray-300'
                        )}
                        step="0.5"
                        type="number"
                        placeholder="2"
                        min={'0'}
                      />
                      <div className="h-full absolute right-4 top-0 flex items-center">
                        <span className="font-medium text-gray-600">{base}</span>
                      </div>
                    </div>
                    {errors.amount && <p className="text-red-500 text-sm italic mt-2">{errors.amount.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="expiry" className="block mb-1 text-sm font-medium text-gray-600">
                      Expiry
                    </label>
                    <div className="flex items-center">
                      <input
                        {...register('expiry')}
                        className={clsx(
                          'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
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

                <div className="mt-6">
                  <Button
                    disabled={Object.keys(errors).length > 0 || isSubmitting}
                    className="w-full justify-center font-medium"
                    onClick={handleSubmit(handleAddButtonClick)}
                    variant="primary-solid"
                    isLoading={isSubmitting}
                  >
                    Add Bounty
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
