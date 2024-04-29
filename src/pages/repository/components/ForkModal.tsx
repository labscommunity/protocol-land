import { Dialog, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React, { Fragment } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'
import useCursorNotAllowed from '@/helpers/hooks/useCursorNotAllowded'
import { withAsync } from '@/helpers/withAsync'
import { createNewFork } from '@/lib/git'
import { useGlobalStore } from '@/stores/globalStore'
import { getRepositoryMetaFromContract, isRepositoryNameAvailable } from '@/stores/repository-core/actions/repoMeta'
import { Repo } from '@/types/repository'

type NewRepoModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
  repo: Repo | Record<PropertyKey, never>
}

const schema = yup
  .object({
    title: yup
      .string()
      .matches(
        /^[a-zA-Z0-9._-]+$/,
        'The repository title can only contain ASCII letters, digits, and the characters ., -, and _.'
      )
      .required('Title is required'),
    description: yup.string()
  })
  .required()

export default function ForkModal({ setIsOpen, isOpen, repo }: NewRepoModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const connectedAddress = useGlobalStore((state) => state.authState.address)
  const navigate = useNavigate()
  const { cursorNotAllowed, closeModalCursor } = useCursorNotAllowed(isSubmitting)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    values: {
      title: repo.name,
      description: repo.description
    },
    resolver: yupResolver(schema)
  })

  function closeModal() {
    if (isSubmitting) return
    setIsOpen(false)
  }

  async function isRepositoryAlreadyForked(repoId: string) {
    if (repo.forks[connectedAddress!]) return true

    const { response: fetchedRepo } = await withAsync(() => getRepositoryMetaFromContract(repoId))
    return fetchedRepo && fetchedRepo.result && fetchedRepo.result.forks[connectedAddress!]
  }

  async function handleCreateFork(data: yup.InferType<typeof schema>) {
    setIsSubmitting(true)

    const payload = {
      name: data.title,
      description: data.description ?? '',
      parent: repo.id,
      dataTxId: repo.dataTxId
    }

    const alreadyForked = await isRepositoryAlreadyForked(repo.id)

    if (alreadyForked) {
      toast.error("You've already forked this repository.")
      setIsOpen(false)
    } else {
      const { response: isAvailable, error: checkError } = await withAsync(() =>
        isRepositoryNameAvailable(payload.name, connectedAddress as string)
      )

      if (!checkError && isAvailable === false) {
        toast.error(`The repository ${payload.name} already exists.`)
        setIsSubmitting(false)
        return
      }

      const { response, error } = await withAsync(() => createNewFork(payload))

      if (error) {
        toast.error('Failed to fork this repo.')
      }

      if (response) {
        setIsOpen(false)
        navigate(`/repository/${response}`)
      }
    }

    setIsSubmitting(false)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className={clsx('relative z-10', cursorNotAllowed)} onClose={closeModal}>
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
                    Create a new Fork
                  </Dialog.Title>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className={clsx('w-6 h-6', closeModalCursor)} />
                </div>
                <div className="mt-6 flex flex-col gap-2.5">
                  <div>
                    <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
                      Title *
                    </label>
                    <input
                      type="text"
                      {...register('title')}
                      className={clsx(
                        'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                        errors.title ? 'border-red-500' : 'border-gray-300',
                        cursorNotAllowed
                      )}
                      placeholder="my-cool-repo"
                      disabled={isSubmitting}
                    />
                    {errors.title && <p className="text-red-500 text-sm italic mt-2">{errors.title?.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-600">
                      Description <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      {...register('description')}
                      className={clsx(
                        'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                        errors.description ? 'border-red-500' : 'border-gray-300',
                        cursorNotAllowed
                      )}
                      placeholder="A really cool repo fully decentralized"
                      disabled={isSubmitting}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm italic mt-2">{errors.description?.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    isLoading={isSubmitting}
                    disabled={Object.keys(errors).length > 0 || isSubmitting}
                    className={clsx('w-full justify-center font-medium', cursorNotAllowed)}
                    onClick={handleSubmit(handleCreateFork)}
                    variant="primary-solid"
                  >
                    Create
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
