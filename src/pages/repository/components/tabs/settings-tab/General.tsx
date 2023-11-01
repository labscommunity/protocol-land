import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

const titleSchema = yup
  .object({
    title: yup
      .string()
      .required('Title is required')
      .matches(/^[a-z]+(-[a-z]+)*$/, 'Invalid title format')
  })
  .required()

const descriptionSchema = yup
  .object({
    description: yup.string().required('Description is required')
  })
  .required()

export default function General() {
  const [selectedRepo, updateDescription, updateName, isRepoOwner] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.updateRepoDescription,
    state.repoCoreActions.updateRepoName,
    state.repoCoreActions.isRepoOwner
  ])
  const {
    register: registerTitle,
    handleSubmit: handleTitleSubmit,
    formState: { errors: titleErrors }
  } = useForm({
    resolver: yupResolver(titleSchema)
  })
  const {
    register: registerDescription,
    handleSubmit: handleDescriptionSubmit,
    formState: { errors: descriptionErrors }
  } = useForm({
    resolver: yupResolver(descriptionSchema)
  })

  async function handleUpdateButtonClick(data: yup.InferType<typeof descriptionSchema>) {
    if (selectedRepo) {
      await updateDescription(data.description)
      toast.success('Successfully updated repository description')
    }
  }

  async function handleRenameButtonClick(data: yup.InferType<typeof titleSchema>) {
    if (selectedRepo) {
      await updateName(data.title)
      toast.success('Successfully updated repository name')
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
                disabled
              />
              <Button disabled onClick={handleTitleSubmit(handleRenameButtonClick)} variant="primary-solid">
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
                disabled={!repoOwner}
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
