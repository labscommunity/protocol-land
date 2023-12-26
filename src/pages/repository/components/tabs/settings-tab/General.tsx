import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'
import { isRepositoryNameAvailable } from '@/stores/repository-core/actions'

const titleSchema = yup
  .object({
    title: yup
      .string()
      .required('Title is required')
      .matches(
        /^[a-zA-Z0-9._-]+$/,
        'The repository title can only contain ASCII letters, digits, and the characters ., -, and _.'
      )
  })
  .required()

const descriptionSchema = yup
  .object({
    description: yup.string().required('Description is required')
  })
  .required()

export default function General() {
  const [isSubmittingName, setIsSubmittingName] = useState(false)
  const [isSubmittingDescription, setIsSubmittingDescription] = useState(false)
  const [connectedAddress, selectedRepo, updateDescription, updateName, isRepoOwner] = useGlobalStore((state) => [
    state.authState.address,
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.updateRepoDescription,
    state.repoCoreActions.updateRepoName,
    state.repoCoreActions.isRepoOwner
  ])
  const {
    register: registerTitle,
    handleSubmit: handleTitleSubmit,
    formState: { errors: titleErrors, isValid: isTitleValid, isDirty: isTitleDirty }
  } = useForm({
    resolver: yupResolver(titleSchema),
    mode: 'onChange'
  })
  const {
    register: registerDescription,
    handleSubmit: handleDescriptionSubmit,
    formState: { errors: descriptionErrors, isValid: isDescriptionValid, isDirty: isDescriptionDirty }
  } = useForm({
    resolver: yupResolver(descriptionSchema)
  })

  async function handleUpdateButtonClick(data: yup.InferType<typeof descriptionSchema>) {
    if (selectedRepo && selectedRepo.description !== data.description) {
      setIsSubmittingDescription(true)
      await updateDescription(data.description)
      toast.success('Successfully updated repository description')
      setIsSubmittingDescription(false)
    } else {
      toast.error('The new description you have entered is the same as your current description.')
    }
  }

  async function handleRenameButtonClick(data: yup.InferType<typeof titleSchema>) {
    if (selectedRepo && data.title !== selectedRepo.name) {
      setIsSubmittingName(true)
      const { response: isAvailable, error } = await withAsync(() =>
        isRepositoryNameAvailable(data.title, connectedAddress!)
      )

      if (!error && isAvailable === false) {
        toast.error(`The repository ${data.title} already exists.`)
        setIsSubmittingName(false)
        return
      }

      const { error: updateError } = await withAsync(() => updateName(data.title))
      if (!updateError) {
        toast.success('Successfully updated repository name')
      } else {
        toast.error('Error updating repository name')
      }

      setIsSubmittingName(false)
    } else {
      toast.error('The new name you have entered is the same as your current name.')
    }
  }

  const repoOwner = isRepoOwner()

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full border-b-[1px] border-gray-200 py-1">
        <h1 className="text-2xl text-gray-900">General Settings</h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="w-[50%]">
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
              Repository name
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                {...registerTitle('title')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  titleErrors.title ? 'border-red-500' : 'border-gray-300'
                )}
                defaultValue={selectedRepo?.name}
                placeholder="my-cool-repo"
                disabled={!repoOwner}
              />
              <Button
                isLoading={isSubmittingName}
                disabled={isSubmittingName || !repoOwner || !isTitleValid || !isTitleDirty}
                onClick={handleTitleSubmit(handleRenameButtonClick)}
                variant="primary-solid"
              >
                Rename
              </Button>
            </div>
          </div>
          {titleErrors.title && <p className="text-red-500 text-sm italic mt-2">{titleErrors.title?.message}</p>}
        </div>
        <div className="flex flex-col">
          <div className="w-[50%]">
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
              Repository description
            </label>
            <div className="flex flex-col items-start gap-4">
              <textarea
                rows={4}
                {...registerDescription('description')}
                defaultValue={selectedRepo?.description}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  descriptionErrors.description ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="my-cool-repo"
                disabled={!repoOwner}
              />
              <Button
                isLoading={isSubmittingDescription}
                disabled={!repoOwner || isSubmittingDescription || !isDescriptionValid || !isDescriptionDirty}
                onClick={handleDescriptionSubmit(handleUpdateButtonClick)}
                variant="primary-solid"
              >
                Update
              </Button>
            </div>
          </div>
          {descriptionErrors.description && (
            <p className="text-red-500 text-sm italic mt-2">{descriptionErrors.description?.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
