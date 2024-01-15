import '@uiw/react-md-editor/markdown-editor.css'

import { yupResolver } from '@hookform/resolvers/yup'
import MDEditor from '@uiw/react-md-editor'
import clsx from 'clsx'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { postNewPullRequest } from '@/lib/git/pull-request'
import { Issue, Repo } from '@/types/repository'

import LinkIssue from './LinkIssue'

const prSchema = yup
  .object({
    title: yup.string().required('Title is required')
  })
  .required()

type Props = {
  baseBranch: string
  compareBranch: string
  baseRepo: Repo | null
  compareRepo: Repo | null
  repoId: string
}

export default function NewPRForm({ baseBranch, compareBranch, baseRepo, compareRepo, repoId }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState('')
  const [selectedIssue, setSelectedIssue] = useState<Issue>()

  const navigate = useNavigate()
  const {
    register: register,
    handleSubmit: handlePRSubmit,
    formState: { errors: errors }
  } = useForm({
    resolver: yupResolver(prSchema)
  })

  async function handleCreateButtonClick(data: yup.InferType<typeof prSchema>) {
    const { title } = data

    setIsSubmitting(true)

    if (!baseRepo || !compareRepo) {
      setIsSubmitting(false)

      return
    }

    const PR = await postNewPullRequest({
      baseRepo: {
        repoName: baseRepo.name,
        repoId: baseRepo.id
      },
      compareRepo: {
        repoName: compareRepo.name,
        repoId: compareRepo.id
      },
      title,
      description: description || '',
      linkedIssueId: selectedIssue?.id,
      baseBranch,
      compareBranch,
      repoId
    })

    if (PR) {
      navigate(`/repository/${repoId}/pull/${PR.id}`)
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
            Description
          </label>
          <div>
            <MDEditor height={300} preview="edit" value={description} onChange={(val) => setDescription(val!)} />
          </div>
        </div>
        <div className="w-full">
          <label htmlFor="link-issue" className="block mb-1 text-sm font-medium text-gray-600">
            Link Issue
          </label>
          <LinkIssue selected={selectedIssue} setSelected={setSelectedIssue} issues={baseRepo?.issues ?? []} />
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
