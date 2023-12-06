import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'
import { Issue, PullRequest } from '@/types/repository'

const issuesSchema = yup
  .object({
    title: yup.string().required('Title is required')
  })
  .required()

export default function Title({ issueOrPr, showEdit = true }: { issueOrPr: Issue | PullRequest; showEdit?: boolean }) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [updateIssueDetails, updatePullRequestDetails] = useGlobalStore((state) => [
    state.issuesActions.updateIssueDetails,
    state.pullRequestActions.updatePullRequestDetails
  ])

  async function updateTitle(data: yup.InferType<typeof issuesSchema>) {
    setIsSubmitting(true)

    if (issueOrPr.title !== data.title) {
      if ('assignees' in issueOrPr) {
        await updateIssueDetails(issueOrPr.id, { title: data.title ?? '' })
      } else {
        await updatePullRequestDetails(issueOrPr.id, { title: data.title ?? '' })
      }
    }

    setIsSubmitting(false)
    setIsEditing(false)
  }

  function onCancel() {
    setIsEditing(false)
    reset()
  }

  const {
    register: register,
    handleSubmit,
    reset,
    formState: { errors: errors }
  } = useForm({
    resolver: yupResolver(issuesSchema)
  })

  React.useEffect(() => {
    if (issueOrPr.title || isEditing) {
      reset({ title: issueOrPr.title })
    }
  }, [issueOrPr.title, isEditing])

  return (
    <>
      <div className="flex justify-between items-center gap-3">
        {isEditing ? (
          <div className="flex w-full flex-col">
            <input
              type="text"
              {...register('title')}
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[4px] outline-none',
                errors.title ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="Add new feature"
            />
          </div>
        ) : (
          <h1 className={`${showEdit ? 'text-3xl' : 'text-xl'} text-gray-900`}>
            {issueOrPr?.title} <span className="text-primary-600 ml-2">#{issueOrPr?.id}</span>
          </h1>
        )}
        {showEdit &&
          (isEditing ? (
            <div className="flex gap-2">
              <Button
                className="h-8"
                variant="primary-outline"
                onClick={handleSubmit(updateTitle)}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Save
              </Button>
              <Button className="h-8" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button className="h-8" variant="primary-outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ))}
      </div>
      {errors.title && <p className="text-red-500 text-sm italic">{errors.title?.message}</p>}
    </>
  )
}
