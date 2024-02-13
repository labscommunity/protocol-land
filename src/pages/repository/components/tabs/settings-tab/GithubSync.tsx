import { Listbox, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { HiChevronUpDown } from 'react-icons/hi2'
import { IoCheckmark } from 'react-icons/io5'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

const schema = yup
  .object()
  .shape({
    repository: yup.string().trim().required('Repository is required'),
    branch: yup
      .string()
      .trim()
      .transform((value: string) => {
        return value.replace('Select a Branch', '').trim()
      })
      .required('Branch name is required'),
    workflowId: yup.string().required('Workflow ID is required'),
    accessToken: yup.string().trim().required('Personal Access Token is required'),
    privateStateTxId: yup.string().notRequired()
  })
  .required()

export default function GithubSync() {
  const [selectedRepo, branchActions, branchState, isRepoOwner, updateGithubSync, getGitHubPAT] = useGlobalStore(
    (state) => [
      state.repoCoreState.selectedRepo.repo,
      state.branchActions,
      state.branchState,
      state.repoCoreActions.isRepoOwner,
      state.repoCoreActions.updateGithubSync,
      state.repoCoreActions.getGitHubPAT
    ]
  )
  const defaultBranch = 'Select a Branch'
  const [branches, setBranches] = useState<string[]>([defaultBranch])
  const [selectedBranch, setSelectedBranch] = useState(branches[0])
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const githubSync = selectedRepo?.githubSync
  const repoOwner = isRepoOwner()

  async function handleUpdateButtonClick(data: yup.InferType<typeof schema>) {
    const isChanged =
      Object.entries(data).filter(([key, value]) => {
        // @ts-ignore
        return githubSync && value && githubSync[key] !== value
      }).length > 0

    if (selectedRepo && isChanged) {
      setIsUpdating(true)

      const { error } = await withAsync(() => updateGithubSync(data as any))
      if (error) {
        toast.success('Failed to update GitHub Sync settings.')
      } else {
        toast.success('Successfully updated GitHub Sync settings.')
      }
      setIsUpdating(false)
    } else {
      toast.error('Please update GitHub Sync settings')
    }
  }

  async function handleTriggerWorkflow() {
    try {
      setIsSyncing(true)
      const accessToken = await getGitHubPAT()
      const response = await fetch(
        `https://api.github.com/repos/${githubSync?.repository}/actions/workflows/${githubSync?.workflowId}/dispatches`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ ref: githubSync?.branch, inputs: {} })
        }
      )

      if (response.status !== 204) {
        throw new Error('Failed to Sync to GitHub')
      }
    } catch (error) {
      toast.error('Failed to Sync to GitHub')
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    branchActions.listBranches()
  }, [])

  useEffect(() => {
    if (branchState.status === 'SUCCESS' && branches.length === 1 && selectedRepo) {
      if (githubSync?.branch) {
        setSelectedBranch(githubSync.branch)
        setValue('branch', githubSync.branch)
      }
      setBranches([defaultBranch, ...branchState.branchList])
    }
  }, [branchState, selectedRepo])

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full border-b-[1px] border-gray-200 py-1">
        <h1 className="text-2xl text-gray-900">GitHub Sync</h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <span className="text-md">
            GitHub Sync lets you sync Protocol.Land repositories to GitHub with some configuration and Github Workflow.
          </span>
          <div className="flex flex-col">
            <div className="w-[50%]">
              <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
                Repository
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  {...register('repository')}
                  className={clsx(
                    'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                    errors.repository ? 'border-red-500' : 'border-gray-300'
                  )}
                  defaultValue={githubSync?.repository ?? ''}
                  placeholder="labscommunity/protocol-land"
                  disabled={!repoOwner}
                />
              </div>
            </div>
            {errors.repository && <p className="text-red-500 text-sm italic mt-2">{errors.repository?.message}</p>}
          </div>
          <div className="w-full">
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
              Select a branch with your GitHub workflow file
            </label>
            <div className="flex items-center gap-4">
              <div className="w-[50%]">
                <Listbox
                  {...register('branch')}
                  value={selectedBranch}
                  onChange={(value) => {
                    setSelectedBranch(value)
                    setValue('branch', value)
                  }}
                >
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                      <span className="block truncate">{selectedBranch}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <HiChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {branches.map((branch, branchIdx) => (
                          <Listbox.Option
                            key={branchIdx}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-primary-100' : 'text-gray-900'
                              }`
                            }
                            value={branch}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {branch}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-700">
                                    <IoCheckmark className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            </div>
            {errors.branch && <p className="text-red-500 text-sm italic mt-2">{errors.branch?.message}</p>}
          </div>
          <div className="flex flex-col">
            <div className="w-[50%]">
              <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
                Workflow Name or ID
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  {...register('workflowId')}
                  className={clsx(
                    'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                    errors.workflowId ? 'border-red-500' : 'border-gray-300'
                  )}
                  defaultValue={githubSync?.workflowId ?? ''}
                  placeholder="sync.yml"
                  disabled={!repoOwner}
                />
              </div>
            </div>
            {errors.workflowId && <p className="text-red-500 text-sm italic mt-2">{errors.workflowId?.message}</p>}
          </div>
          <div className="flex flex-col">
            <div className="w-[50%]">
              <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
                Personal Access Token
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  {...register('accessToken')}
                  className={clsx(
                    'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                    errors.accessToken ? 'border-red-500' : 'border-gray-300'
                  )}
                  defaultValue={githubSync?.accessToken ?? ''}
                  placeholder="github_pat_11AC2JVRA0eFSV5B7vA5hW"
                  disabled={!repoOwner}
                />
              </div>
            </div>
            {errors.accessToken && <p className="text-red-500 text-sm italic mt-2">{errors.accessToken?.message}</p>}
          </div>
          <div className="flex gap-3">
            <Button
              disabled={isUpdating || !repoOwner}
              isLoading={isUpdating}
              onClick={handleSubmit(handleUpdateButtonClick)}
              variant="primary-solid"
            >
              Save
            </Button>
            {githubSync && (
              <Button
                disabled={!repoOwner}
                isLoading={isSyncing}
                onClick={handleTriggerWorkflow}
                variant="primary-solid"
              >
                GitHub Sync
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
