import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
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
  repoName: string
}

export default function NewPRForm({ baseBranch, compareBranch, repoName }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
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

    setIsSubmitting(true)

    const PR = await postNewPullRequest({
      repoName,
      title,
      description: description || '',
      baseBranch,
      compareBranch,
      repoId: id!
    })

    if (PR) {
      navigate(`/repository/${id}/pull/${PR.id}`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl text-gray-900">Pull request details</h1>
      <div className="flex flex-col gap-2.5">
        <div className="w-full">
          <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
            Title
          </label>
          <div className="flex flex-col items-start gap-4">
            <input
              type="text"
              {...register('title')}
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                errors.title ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="feature"
            />
          </div>
          {errors.title && <p className="text-red-500 text-sm italic mt-2">{errors.title?.message}</p>}
        </div>
        <div className="w-full">
          <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
            Description <span className="font-normal italic">(optional)</span>
          </label>
          <div className="flex flex-col items-start gap-4">
            <textarea
              rows={6}
              {...register('description')}
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
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
            variant="primary-solid"
            className="font-medium"
            disabled={Object.keys(errors).length > 0 || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Create Pull request'}
          </Button>
        </div>
      </div>
    </div>
  )
}
