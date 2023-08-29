import { Dialog, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React, { Fragment } from 'react'
import { FileWithPath, useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { AiFillCloseCircle } from 'react-icons/ai'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import useCommit from '@/pages/repository/hooks/useCommit'
import { useGlobalStore } from '@/stores/globalStore'

type NewBranchModal = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
}

const schema = yup
  .object({
    commit: yup.string().required('Commit message is required.')
  })
  .required()

export default function AddFilesModal({ setIsOpen, isOpen }: NewBranchModal) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const { addFiles } = useCommit()
  const { id } = useParams()
  const [userRepo, address] = useGlobalStore((state) => [
    state.repositoryActions.getUserRepositoryMetaById(id!),
    state.authState.address
  ])

  const [files, setFiles] = React.useState<FileWithPath[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  function closeModal() {
    setIsOpen(false)
  }

  function onDrop(acceptedFiles: FileWithPath[]) {
    setFiles(acceptedFiles)
  }

  async function handleCommitSubmit(data: yup.InferType<typeof schema>) {
    if (files.length > 0 && userRepo) {
      setIsSubmitting(true)

      const result = await addFiles({
        files,
        id: id!,
        message: data.commit,
        name: userRepo.name,
        owner: address!
      })
      console.log({ result })

      setIsSubmitting(false)
      closeModal()
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="w-full flex justify-between align-middle">
                  <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-liberty-dark-100">
                    Add Files/Folder
                  </Dialog.Title>
                  <AiFillCloseCircle onClick={closeModal} className="h-6 w-6 text-liberty-dark-100 cursor-pointer" />
                </div>
                <div className="mt-10 flex flex-col gap-2.5">
                  <div
                    className="flex cursor-pointer flex-col overflow-auto p-4 items-center h-36 max-h-36 border-2 border-liberty-light-400 border-dashed"
                    {...getRootProps()}
                  >
                    <input {...getInputProps()} />
                    {files.length === 0 && (
                      <div className="h-full flex justify-center items-center">
                        {!isDragActive && (
                          <span className="text-liberty-dark-100 font-medium">
                            Drag 'n' drop some files here, or click to select files
                          </span>
                        )}
                        {isDragActive && (
                          <span className="text-liberty-dark-100 font-medium">Drop the files here ...</span>
                        )}
                      </div>
                    )}
                    {files.length > 0 && (
                      <div className="flex flex-col w-full gap-1">
                        {files.map((file) => (
                          <div className="w-full flex">
                            <span className="text-liberty-dark-100">{file?.path || ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2.5">
                  <div>
                    <label htmlFor="title" className="block mb-1 text-md font-medium text-liberty-dark-100">
                      Commit message
                    </label>
                    <input
                      type="text"
                      {...register('commit')}
                      className={clsx(
                        'bg-gray-50 border  text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                        errors.commit ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="Example: Add README.md file"
                    />
                    {errors.commit && <p className="text-red-500 text-sm italic mt-2">{errors.commit?.message}</p>}
                  </div>
                </div>

                <div className="mt-6">
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
                      //   disabled={Object.keys(errors).length > 0}
                      className="rounded-md disabled:bg-opacity-[0.7]"
                      onClick={handleSubmit(handleCommitSubmit)}
                      variant="solid"
                    >
                      Commit
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
