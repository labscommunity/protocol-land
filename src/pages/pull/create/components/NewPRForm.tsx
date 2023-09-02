import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { postNewPullRequest } from '@/lib/git/pull-request'

const prSchema = yup
  .object({
    title: yup.string().required('Title is required'),
    description: yup.string()
  })
  .required()

type Props = {
  baseBranch: string
  compareBranch: string
}

export default function NewPRForm({ baseBranch, compareBranch }: Props) {
  const { id } = useParams()
  const {
    register: register,
    handleSubmit: handlePRSubmit,
    formState: { errors: errors }
  } = useForm({
    resolver: yupResolver(prSchema)
  })

  async function handleCreateButtonClick(data: yup.InferType<typeof prSchema>) {
    const { title, description } = data

    const PR = await postNewPullRequest({
      title,
      description: description || '',
      baseBranch,
      compareBranch,
      repoId: id!
    })

    if (PR) {
      console.log({ PR })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl text-liberty-dark-100">Pull request details</h1>
      <div className="flex flex-col gap-2">
        <div className="w-full">
          <label htmlFor="title" className="block mb-1 text-md font-medium text-liberty-dark-100">
            Title
          </label>
          <div className="flex flex-col items-start gap-4">
            <input
              type="text"
              {...register('title')}
              className={clsx(
                'bg-gray-50 border  text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                errors.title ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="feature"
            />
          </div>
          {errors.title && <p className="text-red-500 text-sm italic mt-2">{errors.title?.message}</p>}
        </div>
        <div className="w-full">
          <label htmlFor="title" className="block mb-1 text-md font-medium text-liberty-dark-100">
            Description <span className="font-normal italic">(optional)</span>
          </label>
          <div className="flex flex-col items-start gap-4">
            <textarea
              rows={6}
              {...register('description')}
              className={clsx(
                'bg-gray-50 border resize-none text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                errors.description ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="Feature description"
            />
          </div>
          {errors.description && <p className="text-red-500 text-sm italic mt-2">{errors.description?.message}</p>}
        </div>
        <div className="mt-6 w-full flex justify-center">
          <Button
            onClick={handlePRSubmit(handleCreateButtonClick)}
            variant="solid"
            className="rounded-full font-medium"
          >
            Create Pull request
          </Button>
        </div>
      </div>
    </div>
  )
}
