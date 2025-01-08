import { Dialog, Tab, TabGroup, TabList, TabPanel, TabPanels, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React, { ChangeEvent, Fragment } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import * as yup from 'yup'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'
import CostEstimatesToolTip from '@/components/CostEstimatesToolTip'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { withAsync } from '@/helpers/withAsync'
import { spawnTokenProcess } from '@/lib/decentralize'
import { createNewRepo, postNewRepo } from '@/lib/git'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { useGlobalStore } from '@/stores/globalStore'
import { isRepositoryNameAvailable } from '@/stores/repository-core/actions/repoMeta'

type NewRepoModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
}

const schema = yup
  .object({
    title: yup
      .string()
      .matches(
        /^[a-zA-Z0-9._-]+$/,
        'The repository title can only contain ASCII letters, digits, and the characters ., -, and _.'
      )
      .required('Title is required'),
    description: yup.string()
  })
  .required()

export default function NewRepoModal({ setIsOpen, isOpen }: NewRepoModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [visibility, setVisibility] = React.useState('public')
  const navigate = useNavigate()
  const [authState] = useGlobalStore((state) => [state.authState])
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  function closeModal() {
    setIsOpen(false)
  }

  async function handleCreateBtnClick(data: yup.InferType<typeof schema>) {
    setIsSubmitting(true)

    const id = uuidv4()
    const { title, description } = data
    const owner = authState.address || 'Protocol.Land user'

    const { response: isAvailable, error } = await withAsync(() => isRepositoryNameAvailable(title))

    if (!error && isAvailable === false) {
      toast.error(`The repository ${title} already exists.`)
      setIsSubmitting(false)
      return
    }

    try {
      const fs = fsWithName(id)
      const createdRepo = await createNewRepo(title, fs, owner, id)
      const tokenProcessId = await spawnTokenProcess(title)

      if (createdRepo && createdRepo.commit && createdRepo.repoBlob) {
        const { repoBlob } = createdRepo

        const result = await postNewRepo({
          id,
          title,
          description,
          file: repoBlob,
          owner: authState.address,
          visibility,
          tokenProcessId
        })

        if (result.txResponse) {
          trackGoogleAnalyticsEvent('Repository', 'Successfully created a repo', 'Create new repo', {
            repo_id: id,
            repo_name: title
          })

          navigate(`/repository/${id}`)
        }
      }
    } catch (error) {
      trackGoogleAnalyticsEvent('Repository', 'Failed to create a new repo', 'Create new repo')
    }
  }

  function handleRepositoryVisibilityChange(event: ChangeEvent<HTMLInputElement>) {
    setVisibility(event.target.value)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
              <Dialog.Panel className="w-full max-w-md transform rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* <NewRepoModalTabs /> */}
                <div className="flex justify-end items-center mb-4">
                  <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                </div>
                <TabGroup>
                  <TabList
                    className={
                      'h-10 items-center justify-center rounded-md bg-[hsl(240,4.8%,95.9%)] p-1 text-muted-foreground grid w-full grid-cols-2'
                    }
                  >
                    <Tab
                      className={
                        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-white data-[selected]:text-black data-[selected]:shadow-sm'
                      }
                    >
                      Repository
                    </Tab>
                    <Tab
                      className={
                        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-white data-[selected]:text-black text-gray-500 data-[selected]:shadow-sm'
                      }
                    >
                      Organization
                    </Tab>
                  </TabList>
                  <TabPanels className={'mt-4'}>
                    <TabPanel>
                      <div className="w-full flex justify-between align-middle">
                        <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                          Create a new repository
                        </Dialog.Title>
                      </div>
                      <div className="mt-4 flex flex-col gap-2.5">
                        <div>
                          <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
                            Title *
                          </label>
                          <input
                            type="text"
                            {...register('title')}
                            className={clsx(
                              'bg-white text-sm border-[1px] h-10 text-gray-900 rounded-md hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none placeholder:text-sm',
                              errors.title ? 'border-red-500' : 'border-gray-300'
                            )}
                            placeholder="my-cool-repo"
                          />
                          {errors.title && <p className="text-red-500 text-sm italic mt-2">{errors.title?.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-600">
                            Description <span className="text-gray-400 text-xs">(optional)</span>
                          </label>
                          <input
                            type="text"
                            {...register('description')}
                            className={clsx(
                              'bg-white text-sm border-[1px] text-gray-900 h-10 rounded-md hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none placeholder:text-sm',
                              errors.description ? 'border-red-500' : 'border-gray-300'
                            )}
                            placeholder="A really cool repo fully decentralized"
                          />
                          {errors.description && (
                            <p className="text-red-500 text-sm italic mt-2">{errors.description?.message}</p>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h1 className="mb-1 text-sm font-medium text-gray-600">Repository visibility</h1>
                          <div className="flex flex-row gap-2">
                            <label htmlFor="radio-1" className="flex items-center text-sm font-medium">
                              <input
                                type="radio"
                                name="radio-group"
                                onChange={handleRepositoryVisibilityChange}
                                value="public"
                                defaultChecked
                                className="mr-2 text-sm rounded-full h-4 w-4 checked:accent-primary-700 accent-primary-600 bg-white focus:ring-primary-600  outline-none"
                              />
                              Public
                            </label>
                          </div>
                        </div>
                        <div className="py-1">
                          <CostEstimatesToolTip fileSizes={[2740]} />
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button
                          isLoading={isSubmitting}
                          disabled={Object.keys(errors).length > 0 || isSubmitting}
                          className="w-full justify-center font-medium h-10 !text-sm"
                          onClick={handleSubmit(handleCreateBtnClick)}
                          variant="primary-solid"
                        >
                          Create Repository
                        </Button>
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <div className="w-full flex justify-between align-middle">
                        <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                          Create a new organization
                        </Dialog.Title>
                      </div>
                      <div className="mt-4 flex flex-col gap-2.5">
                        <div>
                          <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
                            Title *
                          </label>
                          <input
                            type="text"
                            {...register('title')}
                            className={clsx(
                              'bg-white text-sm border-[1px] text-gray-900 rounded-md hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] h-10 outline-none placeholder:text-sm',
                              errors.title ? 'border-red-500' : 'border-gray-300'
                            )}
                            placeholder="my-cool-repo"
                          />
                          {errors.title && <p className="text-red-500 text-sm italic mt-2">{errors.title?.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-600">
                            Description <span className="text-gray-400 text-xs">(optional)</span>
                          </label>
                          <input
                            type="text"
                            {...register('description')}
                            className={clsx(
                              'bg-white text-sm border-[1px] text-gray-900 rounded-md hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] h-10 outline-none placeholder:text-sm',
                              errors.description ? 'border-red-500' : 'border-gray-300'
                            )}
                            placeholder="A really cool repo fully decentralized"
                          />
                          {errors.description && (
                            <p className="text-red-500 text-sm italic mt-2">{errors.description?.message}</p>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h1 className="mb-1 text-sm font-medium text-gray-600">Organization visibility</h1>
                          <div className="flex flex-row gap-2">
                            <label htmlFor="radio-1" className="flex items-center text-sm font-medium">
                              <input
                                type="radio"
                                name="radio-group"
                                onChange={handleRepositoryVisibilityChange}
                                value="public"
                                defaultChecked
                                className="mr-2 text-sm rounded-full h-4 w-4 checked:accent-primary-700 accent-primary-600 bg-white focus:ring-primary-600  outline-none"
                              />
                              Public
                            </label>
                          </div>
                        </div>
                        <div className="py-1">
                          <CostEstimatesToolTip fileSizes={[2740]} />
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button
                          isLoading={isSubmitting}
                          disabled={Object.keys(errors).length > 0 || isSubmitting}
                          className="w-full justify-center font-medium h-10 !text-sm"
                          onClick={handleSubmit(handleCreateBtnClick)}
                          variant="primary-solid"
                        >
                          Create Organization
                        </Button>
                      </div>
                    </TabPanel>
                  </TabPanels>
                </TabGroup>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
