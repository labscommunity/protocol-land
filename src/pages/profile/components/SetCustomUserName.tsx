import { Dialog, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { Fragment } from 'react'
import { useForm } from 'react-hook-form'
import SVG from 'react-inlinesvg'
import * as yup from 'yup'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'

type Props = {
  closeModal: () => void
  goBack: () => void
  onUsernameChange: (value: string, type: string) => void
}

const schema = yup.object().shape(
  {
    username: yup
      .string()
      .trim()
      .required()
      .when('username', {
        is: (value: string) => value?.length > 0,
        then: (rule) =>
          rule
            .min(4, 'Username must be more than 3 characters.')
            .max(39, 'Username must be at most 39 characters.')
            .matches(
              /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){3,38}$/,
              'Invalid username format. Use only letters, numbers, and hyphens. It must start with a letter or number and be at most 39 characters.'
            )
      })
  },
  [['username', 'username']]
)

export default function SetCustomUserName({ closeModal, goBack, onUsernameChange }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  async function handleContinueClick(data: yup.InferType<typeof schema>) {
    onUsernameChange(data.username, 'custom')
    closeModal()
  }

  return (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Dialog.Panel className="w-full max-w-[368px] transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
        <div className="w-full flex justify-between align-middle">
          <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
            Set Username
          </Dialog.Title>
          <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
        </div>
        <div className="mt-6 flex flex-col gap-2.5">
          <div>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-2.5 pt-[10px] pb-[10px] outline-none',
                errors.username ? 'border-red-500' : 'border-gray-300'
              )}
              {...register('username')}
              placeholder="johncancode"
            />
            {errors.username && <p className="text-red-500 text-sm italic mt-2">{errors.username?.message}</p>}
          </div>
        </div>

        <div className="w-full mt-4 flex flex-col gap-2">
          <Button
            // isLoading={isSubmitting}
            disabled={errors.username ? true : false}
            onClick={handleSubmit(handleContinueClick)}
            className="w-full justify-center font-medium"
            variant="primary-solid"
          >
            Continue
          </Button>
          <Button onClick={() => goBack()} className="w-full justify-center font-medium" variant="primary-outline">
            Go back
          </Button>
        </div>
      </Dialog.Panel>
    </Transition.Child>
  )
}
