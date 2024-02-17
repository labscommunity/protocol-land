import { Listbox, Switch, Transition } from '@headlessui/react'
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
    privateStateTxId: yup.string().notRequired(),
    enabled: yup.boolean().notRequired().default(false)
  })
  .required()

export default function GithubSync() {
  const [
    connectedAddress,
    selectedRepo,
    branchActions,
    branchState,
    isRepoOwner,
    updateGithubSync,
    githubSyncAllowPending,
    triggerGithubSync
  ] = useGlobalStore((state) => [
    state.authState.address,
    state.repoCoreState.selectedRepo.repo,
    state.branchActions,
    state.branchState,
    state.repoCoreActions.isRepoOwner,
    state.repoCoreActions.updateGithubSync,
    state.repoCoreActions.githubSyncAllowPending,
    state.repoCoreActions.triggerGithubSync
  ])
  const defaultBranch = 'Select a Branch'
  const [branches, setBranches] = useState<string[]>([defaultBranch])
  const [selectedBranch, setSelectedBranch] = useState(branches[0])
  const [isUpdating, setIsUpdating] = useState(false)
  const [isTriggering, setIsTriggering] = useState(false)
  const [isAllowing, setIsAllowing] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [forcePush, setForcePush] = useState(false)

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
  const canTrigger = githubSync?.allowed?.includes(connectedAddress as string)

  async function handleUpdateButtonClick(data: yup.InferType<typeof schema>) {
    const dataToUpdate = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        if (githubSync && value !== undefined) {
          // @ts-ignore
          return githubSync[key] !== value
        }

        return true
      })
    )

    const isChanged = Object.keys(dataToUpdate).length > 0

    if (selectedRepo && isChanged) {
      setIsUpdating(true)

      const { error } = await withAsync(() => updateGithubSync(dataToUpdate as any))
      if (error) {
        toast.success('Failed to update GitHub Sync settings.')
      } else {
        toast.success('Successfully updated GitHub Sync settings.')
      }
      setIsUpdating(false)
    } else {
      toast.error('Please update settings to save')
    }
  }

  async function handleTriggerWorkflow() {
    setIsTriggering(true)
    const { error } = await withAsync(() => triggerGithubSync({ manualTrigger: true, forcePush }))

    if (error) {
      toast.error('Failed to trigger GitHub Sync')
    } else {
      toast.success('Successfully triggered GitHub Sync')
    }

    setIsTriggering(false)
  }

  async function handleAllowPendingContributors() {
    setIsAllowing(true)
    const { error } = await withAsync(() => githubSyncAllowPending())
    if (error) {
      toast.error('Failed to allow pending contributors')
    } else {
      toast.success('Successfully allowed pending contributors')
    }
    setIsAllowing(false)
  }

  useEffect(() => {
    branchActions.listBranches()
  }, [])

  useEffect(() => {
    if (branchState.status === 'SUCCESS' && branches.length === 1 && selectedRepo) {
      if (githubSync?.branch) {
        setSelectedBranch(githubSync.branch)
        setValue('branch', githubSync.branch)
        setEnabled(!!githubSync.enabled)
        setValue('enabled', !!githubSync.enabled)
      }
      setBranches([defaultBranch, ...branchState.branchList])
    }
  }, [branchState, selectedRepo])

  useEffect(() => {
    if (githubSync?.accessToken) {
      setValue('accessToken', githubSync?.accessToken)
    }
  }, [githubSync])

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
          <div className="flex items-center gap-2">
            <Switch
              checked={enabled}
              disabled={!repoOwner}
              onChange={(checked) => {
                setEnabled(checked)
                setValue('enabled', checked)
              }}
              className={`${
                enabled ? 'bg-primary-900' : 'bg-primary-700'
              } relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
            >
              <span
                aria-hidden="true"
                className={`${enabled ? 'translate-x-6' : 'translate-x-0'}
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
            <span>{enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
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
              Select a branch containing your GitHub workflow file
            </label>
            <div className="flex items-center gap-4">
              <div className="w-[50%]">
                <Listbox
                  {...register('branch')}
                  value={selectedBranch}
                  disabled={!repoOwner}
                  onChange={(value) => {
                    setSelectedBranch(value)
                    setValue('branch', value)
                  }}
                >
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white px-3 py-[10px] border-[1px] text-left shadow-md focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 text-base text-gray-900">
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
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
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
              disabled={!repoOwner || isUpdating}
              isLoading={isUpdating}
              onClick={handleSubmit(handleUpdateButtonClick)}
              variant="primary-solid"
            >
              Save
            </Button>
            {repoOwner && githubSync?.pending && githubSync.pending.length > 0 && (
              <Button
                disabled={!repoOwner || isAllowing}
                isLoading={isAllowing}
                onClick={handleAllowPendingContributors}
                variant="primary-solid"
              >
                Allow pending Contributors
              </Button>
            )}
          </div>
          {githubSync && canTrigger && (
            <div className="flex flex-col gap-3">
              <span className="text-lg font-medium">Manual Trigger Sync</span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={forcePush}
                  onChange={setForcePush}
                  className={`${
                    forcePush ? 'bg-primary-900' : 'bg-primary-700'
                  } relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
                >
                  <span
                    aria-hidden="true"
                    className={`${forcePush ? 'translate-x-6' : 'translate-x-0'}
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
                <span>Force Push: {forcePush ? 'On' : 'Off'}</span>
              </div>
              <Button
                className="w-fit"
                disabled={isTriggering}
                isLoading={isTriggering}
                loadingText="Triggering"
                onClick={handleTriggerWorkflow}
                variant="primary-solid"
              >
                Trigger Sync
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
