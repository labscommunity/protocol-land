import { Dialog, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React, { Fragment } from 'react'
import { useForm } from 'react-hook-form'
import { AiFillCamera, AiFillCloseCircle } from 'react-icons/ai'
// import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
// import { useGlobalStore } from '@/stores/globalStore'

type NewRepoModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
}

const schema = yup
  .object({
    fullname: yup.string().required('Full name is required'),
    username: yup
      .string()
      .required('Username is required')
      .matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, 'Invalid username format')
  })
  .required()

export default function CreateProfileModal({ setIsOpen, isOpen }: NewRepoModalProps) {
  const avatarInputRef = React.useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null)
  const [avatarFile, setAvatarFile] = React.useState<null | File>(null)
  //   const navigate = useNavigate()
  //   const [userAddress] = useGlobalStore((state) => [state.authState.address])
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  function closeModal() {
    setIsOpen(false)
  }

  async function handleCreateBtnClick(data: yup.InferType<typeof schema>) {
    setIsSubmitting(true)

    //
    console.log({ data, avatarFile })
  }

  async function handleAvatarSelectClick() {
    avatarInputRef.current?.click()
  }

  async function handleAvatarChange(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.target.files && evt.target.files[0]) {
      const url = URL.createObjectURL(evt.target.files[0])

      setAvatarFile(evt.target.files[0])
      setAvatarUrl(url)
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
                    Create profile
                  </Dialog.Title>
                  <AiFillCloseCircle onClick={closeModal} className="h-6 w-6 text-liberty-dark-100 cursor-pointer" />
                </div>
                <div className="mt-2 flex flex-col gap-2.5">
                  <div className="flex justify-center">
                    {avatarUrl && (
                      <div
                        onClick={handleAvatarSelectClick}
                        className="relative hover:bg-opacity-50 transition-all duration-300"
                      >
                        <img src={avatarUrl} className="rounded-full w-32 h-32" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white cursor-pointer flex items-center justify-center h-full w-full font-bold text-xl bg-black bg-opacity-50 p-2 rounded-full">
                            <AiFillCamera className="w-8 h-8 text-white" />
                          </span>
                        </div>
                        <input onChange={handleAvatarChange} ref={avatarInputRef} type="file" hidden />
                      </div>
                    )}
                    {!avatarUrl && (
                      <div
                        onClick={handleAvatarSelectClick}
                        className="cursor-pointer w-32 h-32 bg-slate-500 rounded-full flex items-center justify-center"
                      >
                        <AiFillCamera className="w-8 h-8 text-white" />
                        <input onChange={handleAvatarChange} ref={avatarInputRef} type="file" hidden />
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="fullname" className="block mb-1 text-md font-medium text-liberty-dark-100">
                      Full name
                    </label>
                    <input
                      type="text"
                      {...register('fullname')}
                      className={clsx(
                        'bg-gray-50 border  text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                        errors.fullname ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="John Doe"
                    />
                    {errors.fullname && <p className="text-red-500 text-sm italic mt-2">{errors.fullname?.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="username" className="block mb-1 text-md font-medium text-liberty-dark-100">
                      Username
                    </label>
                    <input
                      type="text"
                      {...register('username')}
                      className={clsx(
                        'bg-gray-50 border text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="johncancode"
                    />
                    {errors.username && <p className="text-red-500 text-sm italic mt-2">{errors.username?.message}</p>}
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
                      onClick={handleSubmit(handleCreateBtnClick)}
                      variant="solid"
                    >
                      Create
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
