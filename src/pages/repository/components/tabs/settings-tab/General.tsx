import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'

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
    console.log({ data })
  }

  async function handleRenameButtonClick(data: yup.InferType<typeof titleSchema>) {
    console.log({ data })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full border-b-[1px] border-[#cbc9f6] py-1">
        <h1 className="text-2xl text-liberty-dark-100">General Settings</h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="w-[50%]">
            <label htmlFor="title" className="block mb-1 text-md font-medium text-liberty-dark-100">
              Repository name
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                {...registerTitle('title')}
                className={clsx(
                  'bg-gray-50 border  text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                  titleErrors.title ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="my-cool-repo"
              />
              <Button onClick={handleTitleSubmit(handleRenameButtonClick)} className="rounded-full" variant="solid">
                Rename
              </Button>
            </div>
          </div>
          {titleErrors.title && <p className="text-red-500 text-sm italic mt-2">{titleErrors.title?.message}</p>}
        </div>
        <div className="flex flex-col">
          <div className="w-[50%]">
            <label htmlFor="title" className="block mb-1 text-md font-medium text-liberty-dark-100">
              Repository description
            </label>
            <div className="flex flex-col items-start gap-4">
              <textarea
                rows={4}
                {...registerDescription('description')}
                className={clsx(
                  'bg-gray-50 border  text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                  descriptionErrors.description ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="my-cool-repo"
              />
              <Button
                onClick={handleDescriptionSubmit(handleUpdateButtonClick)}
                className="rounded-full"
                variant="solid"
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
