import { Switch } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

const schema = yup
  .object()
  .shape({
    repository: yup
      .string()
      .trim()
      .matches(
        /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}\/[a-zA-Z0-9._-]+$/,
        "Use format 'username/repositoryName'"
      )
      .required('Repository is required'),
    branch: yup.string().trim().required('Branch name is required'),
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
    isRepoOwner,
    updateGithubSync,
    githubSyncAllowPending,
    triggerGithubSync
  ] = useGlobalStore((state) => [
    state.authState.address,
    state.repoCoreState.selectedRepo.repo,
    state.branchActions,
    state.repoCoreActions.isRepoOwner,
    state.repoCoreActions.updateGithubSync,
    state.repoCoreActions.githubSyncAllowPending,
    state.repoCoreActions.triggerGithubSync
  ])
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
    if (githubSync) {
      setEnabled(!!githubSync.enabled)
      setValue('enabled', !!githubSync.enabled)
      if (githubSync?.accessToken) {
        setValue('accessToken', githubSync?.accessToken)
      }
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
              disabled={!repoOwner || selectedRepo?.decentralized}
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
          <div className="w-[50%]">
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
              Branch containing your GitHub workflow file
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                {...register('branch')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  errors.branch ? 'border-red-500' : 'border-gray-300'
                )}
                defaultValue={githubSync?.branch ?? ''}
                placeholder="master"
                disabled={!repoOwner}
              />
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
              disabled={!repoOwner || isUpdating || selectedRepo?.decentralized}
              isLoading={isUpdating}
              onClick={handleSubmit(handleUpdateButtonClick)}
              variant="primary-solid"
            >
              Save
            </Button>
            {repoOwner && githubSync?.pending && githubSync.pending.length > 0 && (
              <Button
                disabled={!repoOwner || isAllowing || selectedRepo?.decentralized}
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
                  disabled={selectedRepo?.decentralized}
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
                disabled={isTriggering || selectedRepo?.decentralized}
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
