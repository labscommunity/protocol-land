import { Dialog, Transition } from '@headlessui/react'
import { Select } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { Fragment } from 'react'
import { useForm } from 'react-hook-form'
import { AiFillCloseCircle } from 'react-icons/ai'
import * as yup from 'yup'

import ButtonWithLoadAndError from '@/components/common/buttons/CustomButton'
import { useGlobalStore } from '@/stores/globalStore'
import { Prize } from '@/types/hackathon'

type WinnerModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
  participantAddress: string
}

const schema = yup
  .object({
    prizeId: yup.string().required('Prize is required')
  })
  .required()

export default function WinnerModal({ setIsOpen, isOpen, participantAddress }: WinnerModalProps) {
  const [selectedHackathon, assignPrizeToSubmission] = useGlobalStore((state) => [
    state.hackathonState.selectedHackathon,
    state.hackathonActions.assignPrizeToSubmission
  ])
  const [submitStatus, setSubmitStatus] = React.useState<'neutral' | 'loading' | 'error' | 'success'>('neutral')

  const [prizes, setPrizes] = React.useState<Prize[]>([])
  const {
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema)
  })

  React.useEffect(() => {
    if (selectedHackathon) {
      let hackathonPrizes: Record<string, Prize> | Prize[] = selectedHackathon.prizes || {}
      hackathonPrizes = Object.values(hackathonPrizes)
      const filteredPrizes = hackathonPrizes.filter((prize) => {
        const assignedCount = Object.values(selectedHackathon.submissions).filter(
          (submission) => submission.status === 'PUBLISHED' && submission.prizeIds.includes(prize.id)
        ).length
        return assignedCount < prize.winningParticipantsCount
      })

      setPrizes(filteredPrizes)
    }
  }, [selectedHackathon])

  React.useEffect(() => {
    if (prizes.length) {
      setValue('prizeId', prizes[0].id)
      trigger('prizeId')
    }
  }, [prizes])

  // React.useEffect(() => {
  //   if (!isOpen) {
  //     reset()
  //   }
  // }, [isOpen, reset])

  function closeModal() {
    reset({})
    setIsOpen(false)
  }

  async function handleSelectWinner(data: yup.InferType<typeof schema>) {
    if (!selectedHackathon) {
      return
    }
    setSubmitStatus('loading')

    const res = await assignPrizeToSubmission(selectedHackathon?.id, data.prizeId, participantAddress)
    setSubmitStatus(res ? 'success' : 'error')

    setTimeout(() => {
      setIsOpen(false)
    }, 800)
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Select Winner Prize
                  </Dialog.Title>
                  <AiFillCloseCircle onClick={closeModal} className="h-6 w-6 text-gray-900 cursor-pointer" />
                </div>
                <div className="mt-2 flex flex-col gap-2.5">
                  <div>
                    <label htmlFor="winnerName" className="block mb-1 text-md font-medium text-gray-900">
                      Winner Prize
                    </label>
                    <div
                      className={
                        ' w-full bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block px-3 py-[10px] outline-none border-gray-300'
                      }
                    >
                      <Select
                        onChange={(evt) => {
                          setValue('prizeId', evt.target.value)
                          trigger('prizeId')
                        }}
                        // {...register('prizeId')}
                        className={'w-full outline-none'}
                        name="status"
                        aria-label="Prize"
                      >
                        {prizes.map((prize) => (
                          <option value={prize.id}>{prize.name}</option>
                        ))}
                      </Select>
                    </div>

                    {errors.prizeId && <p className="text-red-500 text-sm italic mt-2">{errors.prizeId?.message}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <ButtonWithLoadAndError status={submitStatus} onClick={handleSubmit(handleSelectWinner)}>
                    Select Winner
                  </ButtonWithLoadAndError>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
