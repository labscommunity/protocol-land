import { yupResolver } from '@hookform/resolvers/yup'
import MDEditor from '@uiw/react-md-editor'
import clsx from 'clsx'
import React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

const issuesSchema = yup
  .object({
    title: yup.string().required('Title is required')
  })
  .required()

export default function CreateIssuePage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [createIssue, fetchAndLoadRepository] = useGlobalStore((state) => [
    state.issuesActions.createIssue,
    state.repoCoreActions.fetchAndLoadRepository
  ])
  const navigate = useNavigate()
  const { id } = useParams()

  const [value, setValue] = useState('**Hello world!!!**')
  const [preview, setPreview] = useState('edit')
  const {
    register: register,
    handleSubmit,
    formState: { errors: errors }
  } = useForm({
    resolver: yupResolver(issuesSchema)
  })

  React.useEffect(() => {
    if (id) {
      fetchAndLoadRepository(id)
    }
  }, [id])

  function handlePreviewToggle() {
    if (preview === 'edit') {
      setPreview('live')
    } else {
      setPreview('edit')
    }
  }

  async function createNewIssue(data: yup.InferType<typeof issuesSchema>) {
    setIsSubmitting(true)

    const issue = await createIssue(data.title, value)

    if (issue) {
      navigate(`/repository/${id}/issue/${issue.id}`)
    }
  }

  return (
    <div className="h-full flex-1 flex flex-col max-w-[800px] mx-auto w-full mt-6 gap-8">
      <div className="flex flex-col gap-1 border-b-[1px] border-gray-200 pb-2 text-gray-900">
        <h1 className="text-3xl ">Create a new issue</h1>
        <p className="text-lg">As issues are created, they'll appear here in the repository's issues tab.</p>
      </div>
      <div className="flex flex-col gap-4">
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
              placeholder="Add new feature"
            />
          </div>
          {errors.title && <p className="text-red-500 text-sm italic mt-2">{errors.title?.message}</p>}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
              Description
            </label>
            <div>
              <Button onClick={handlePreviewToggle} variant="primary-solid">
                {preview === 'edit' ? 'Preview' : 'Edit'}
              </Button>
            </div>
          </div>
          {preview === 'edit' && (
            <MDEditor height={400} preview="edit" value={value} onChange={(val) => setValue(val!)} />
          )}
          {preview === 'live' && (
            <MDEditor.Markdown className="h-[400px] rounded-lg p-2" source={value} style={{ whiteSpace: 'pre-wrap' }} />
          )}
        </div>
        <div className="flex justify-center py-4">
          <Button
            isLoading={isSubmitting}
            disabled={isSubmitting || value.length === 0}
            onClick={handleSubmit(createNewIssue)}
            variant="primary-solid"
          >
            Create issue
          </Button>
        </div>
      </div>
    </div>
  )
}
