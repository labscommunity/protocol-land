import { Dialog, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React, { Fragment } from 'react'
import { FileWithPath } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import SVG from 'react-inlinesvg'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'
import CostEstimatesToolTip from '@/components/CostEstimatesToolTip'
import useCursorNotAllowed from '@/helpers/hooks/useCursorNotAllowded'
import { withAsync } from '@/helpers/withAsync'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { packGitRepo } from '@/lib/git/helpers/zipUtils'
import useCommit from '@/pages/repository/hooks/useCommit'
import { useGlobalStore } from '@/stores/globalStore'

type NewBranchModal = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
  files: FileWithPath[]
  setIsCommited: React.Dispatch<React.SetStateAction<boolean>>
}

const schema = yup
  .object({
    commit: yup.string().required('Commit message is required.')
  })
  .required()

export default function CommitFilesModal({ setIsOpen, setIsCommited, isOpen, files }: NewBranchModal) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { commit: `Update ${files?.[0]?.name ?? ''}` }
  })

  const { addFiles } = useCommit()
  const { id } = useParams()
  const [userRepo, address, isCreateNewFile] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.authState.address,
    state.repoCoreState.git.isCreateNewFile
  ])

  const [fileSizes, setFileSizes] = React.useState<number[]>([])
  const [repoBlobSize, setRepoBlobSize] = React.useState<number>(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { cursorNotAllowed, closeModalCursor } = useCursorNotAllowed(isSubmitting)

  React.useEffect(() => {
    if (files.length > 0) {
      files.forEach((file) => setFileSizes((prev) => [...prev, file.size]))
      setValue('commit', `${isCreateNewFile ? 'Add' : 'Update'} ${files?.[0]?.name ?? ''}`)
      if (!repoBlobSize) captureRepoBlobSize()
    }
  }, [files])

  function closeModal() {
    if (isSubmitting) return
    setIsOpen(false)
  }

  async function handleCommitSubmit(data: yup.InferType<typeof schema>) {
    if (files.length > 0 && userRepo) {
      setIsSubmitting(true)

      const { error } = await withAsync(() =>
        addFiles({
          files,
          id: id!,
          message: data.commit,
          name: userRepo.name,
          owner: address!,
          defaultBranch: userRepo.defaultBranch || 'master'
        })
      )

      if (!error) {
        setIsCommited(true)
        closeModal()
      } else {
        toast.error('Failed to commit changes')
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
                    Commit changes
                  </Dialog.Title>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className={clsx('w-6 h-6', closeModalCursor)} />
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
                    Commit changes
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
