import { Dialog, Transition } from '@headlessui/react'
// import clsx from 'clsx'
import React, { Fragment } from 'react'
import { useDropzone } from 'react-dropzone'
import { AiFillCloseCircle } from 'react-icons/ai'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'

type NewBranchModal = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
}

export default function AddFilesModal({ setIsOpen, isOpen }: NewBranchModal) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  function closeModal() {
    setIsOpen(false)
  }

  function onDrop(acceptedFiles: any) {
    // Do something with the files
    console.log({ acceptedFiles })
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
                    className="flex flex-col justify-center items-center p-5 h-36 border-2 border-liberty-light-400 border-dashed"
                    {...getRootProps()}
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p className='text-liberty-dark-100'>Drop the files here ...</p>
                    ) : (
                      <p className='text-liberty-dark-100'>Drag 'n' drop some files here, or click to select files</p>
                    )}
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
                      //   disabled={Object.keys(errors).length > 0}
                      className="rounded-md disabled:bg-opacity-[0.7]"
                      //   onClick={handleSubmit(handleCreateBtnClick)}
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
