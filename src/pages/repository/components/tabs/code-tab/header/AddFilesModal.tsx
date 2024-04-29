import { Dialog, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React, { Fragment } from 'react'
import { FileWithPath, useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import SVG from 'react-inlinesvg'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import FolderBrowseIcon from '@/assets/icons/folder-browse.svg'
import { Button } from '@/components/common/buttons'
import CostEstimatesToolTip from '@/components/CostEstimatesToolTip'
import useCursorNotAllowed from '@/helpers/hooks/useCursorNotAllowded'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { packGitRepo } from '@/lib/git/helpers/zipUtils'
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
  const [getCurrentFolderPath, userRepo, address, reloadFilesOnCurrentFolder] = useGlobalStore((state) => [
    state.repoCoreActions.git.getCurrentFolderPath,
    state.repoCoreState.selectedRepo.repo,
    state.authState.address,
    state.repoCoreActions.reloadFilesOnCurrentFolder
  ])

  const [files, setFiles] = React.useState<FileWithPath[]>([])
  const [fileSizes, setFileSizes] = React.useState<number[]>([])
  const [repoBlobSize, setRepoBlobSize] = React.useState<number>(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { cursorNotAllowed, closeModalCursor } = useCursorNotAllowed(isSubmitting)
  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({ onDrop })

  React.useEffect(() => {
    if (files.length > 0) {
      files.forEach((file) => setFileSizes((prev) => [...prev, file.size]))
      if (!repoBlobSize) captureRepoBlobSize()
    }
  }, [files])

  function closeModal() {
    if (isSubmitting) return
    setIsOpen(false)
  }

  function onDrop(acceptedFiles: FileWithPath[]) {
    setFiles(acceptedFiles)
  }

  function joinPaths(...paths: string[]) {
    return '/' + paths.join('/').split('/').filter(Boolean).join('/')
  }

  async function handleCommitSubmit(data: yup.InferType<typeof schema>) {
    if (files.length > 0 && userRepo) {
      try {
        setIsSubmitting(true)

        const basePath = getCurrentFolderPath()

        const updatedFiles = files.map((file) => {
          const updatedPath = joinPaths(basePath, file.path!)
          const updatedFile = new File([file], file.name, {
            lastModified: file.lastModified,
            type: file.type
          })
          Object.defineProperty(updatedFile, 'path', { value: updatedPath })
          return updatedFile as FileWithPath
        })

        await addFiles({
          files: updatedFiles,
          id: id!,
          message: data.commit,
          name: userRepo.name,
          owner: address!,
          defaultBranch: userRepo.defaultBranch || 'master'
        })

        await reloadFilesOnCurrentFolder()

        closeModal()
      } catch (error) {
        toast.error(`Failed to upload new file${files.length > 1 ? 's' : ''}.`)
      }
      setIsSubmitting(false)
    } else {
      toast.error('Please select atleast one file.')
    }
  }

  async function captureRepoBlobSize() {
    if (!userRepo) return
    const fs = fsWithName(id!)
    const dir = `/${userRepo.id}`

    const blob = await packGitRepo({ fs, dir })

    if (blob && blob.size) {
      setRepoBlobSize(blob.size)
    }
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
              <Dialog.Panel className="w-full max-w-[368px] transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="w-full flex justify-between align-middle">
                  <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
                    Upload new Files/Folders
                  </Dialog.Title>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className={clsx('w-6 h-6', closeModalCursor)} />
                </div>
                <div className="mt-6 flex flex-col">
                  <span className="mb-2 font-medium text-sm text-gray-600">Upload files</span>
                  <div
                    className={clsx(
                      'flex flex-col overflow-auto items-center h-36 max-h-36 border-[1px] border-gray-300 rounded-lg border-dashed',
                      closeModalCursor
                    )}
                    {...getRootProps()}
                  >
                    <input {...getInputProps()} disabled={isSubmitting} />
                    {files.length === 0 && (
                      <div className="h-full w-full py-6 px-12 flex justify-center items-center">
                        {!isDragActive && (
                          <div className="flex flex-col gap-4 items-center">
                            <span className="text-gray-700 text-sm text-center">
                              Drag and drop your files here, or click 'Browse Files'
                            </span>
                            <Button
                              className="gap-2"
                              onClick={inputRef.current?.click || undefined}
                              variant="primary-outline"
                            >
                              <SVG src={FolderBrowseIcon} className="w-5 h-5" /> Browse Files
                            </Button>
                          </div>
                        )}
                        {isDragActive && (
                          <span className="text-gray-700 text-sm text-center">Drop the files here ...</span>
                        )}
                      </div>
                    )}
                    {files.length > 0 && (
                      <div className="flex py-[10px] px-6 flex-col w-full gap-2">
                        {files.map((file) => (
                          <div className="w-full flex">
                            <span className="text-gray-600 text-sm font-medium">{file?.path || ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-col">
                  <div>
                    <label htmlFor="title" className="mb-1 block font-medium text-sm text-gray-600">
                      Commit message
                    </label>
                    <input
                      type="text"
                      {...register('commit')}
                      className={clsx(
                        'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                        errors.commit ? 'border-red-500' : 'border-gray-300',
                        cursorNotAllowed
                      )}
                      placeholder="Example: Add README.md file"
                      disabled={isSubmitting}
                    />
                    {errors.commit && <p className="text-red-500 text-sm italic mt-2">{errors.commit?.message}</p>}
                  </div>
                </div>
                <div className="mt-3">
                  <CostEstimatesToolTip fileSizes={[...fileSizes, repoBlobSize]} />
                </div>
                <div className="mt-6">
                  <Button
                    disabled={Object.keys(errors).length > 0 || isSubmitting}
                    isLoading={isSubmitting}
                    className={clsx('w-full justify-center font-medium', cursorNotAllowed)}
                    onClick={handleSubmit(handleCommitSubmit)}
                    variant="primary-solid"
                  >
                    Upload
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
