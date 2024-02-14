import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { resolveUsername, resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { rotateKeysAndUpdate } from '@/lib/git'
import { useGlobalStore } from '@/stores/globalStore'
import { ContributorInvite } from '@/types/repository'

const addressSchema = yup
  .object({
    address: yup
      .string()
      .required('Contributor address is required')
      .matches(/[a-z0-9-_]{43}/i, 'Invalid address')
  })
  .required()

export default function Contributors() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGrantAccessLoading, setIsGrantAccessLoading] = React.useState(false)
  const [isAcceptLoading, setAcceptIsLoading] = React.useState(false)
  const [isRejectLoading, setIsRejectLoading] = React.useState(false)
  const [
    address,
    repo,
    inviteContributor,
    addContributor,
    cancelContributor,
    isRepoOwner,
    acceptContributor,
    rejectContributor
  ] = useGlobalStore((state) => [
    state.authState.address,
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.inviteContributor,
    state.repoCoreActions.addContributor,
    state.repoCoreActions.cancelContributor,
    state.repoCoreActions.isRepoOwner,
    state.repoCoreActions.acceptContributor,
    state.repoCoreActions.rejectContributor
  ])
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(addressSchema)
  })

  async function handleAddButtonClick(data: yup.InferType<typeof addressSchema>) {
    if (repo) {
      const isContributor = repo?.contributors?.find((address) => address === data.address)
      const isOwner = repo.owner === data.address

      if (isContributor || isOwner) {
        toast.error('You already have permissions to this repo')

        return
      }

      try {
        setIsLoading(true)
        const result = await inviteContributor(data.address)
        if (result && result.status) {
          toast.success('Successfully invited a contributor')
        } else {
          throw result?.response || 'Failed to invite.'
        }

        resetField('address')
      } catch (error: any) {
        toast.error(error)
      }

      setIsLoading(false)
    }
  }

  function filterContributorInvited(invite: ContributorInvite) {
    if (!repo) return false
    if (invite.status === 'INVITED') return true

    const contributorExists = repo.contributors.indexOf(invite.address) > -1
    if (repo.private && invite.status === 'ACCEPTED' && !contributorExists) {
      return true
    }

    return false
  }

  async function handleGrantAccessClick(invite: ContributorInvite) {
    if (!repo || !repo.privateStateTxId) return false

    try {
      setIsGrantAccessLoading(true)

      await rotateKeysAndUpdate({ id: repo.id, currentPrivateStateTxId: repo.privateStateTxId, type: 'REPO' })
      await addContributor(invite.address)

      toast.success('Successfully grated access to contributor.')
      setIsGrantAccessLoading(false)
    } catch (error) {
      toast.error('Failed to grant access.')

      console.error({ error })

      setIsGrantAccessLoading(false)
    }
  }

  async function handleCancelInviteClick(invite: ContributorInvite) {
    if (!repo) return false

    try {
      setIsGrantAccessLoading(true)

      await cancelContributor(invite.address)

      toast.success('Successfully cancelled the contributor invite.')

      setIsGrantAccessLoading(false)
    } catch (error) {
      toast.error('Failed to grant access.')

      console.error({ error })

      setIsGrantAccessLoading(false)
    }
  }

  const repoOwner = isRepoOwner()
  const inviteActionsMap = {
    ACCEPTED: ({ invite }: { invite: ContributorInvite }) => (
      <Button
        isLoading={isGrantAccessLoading}
        disabled={!repoOwner || isGrantAccessLoading}
        onClick={() => handleGrantAccessClick(invite)}
        variant="primary-outline"
        className="!py-1"
      >
        Grant Access
      </Button>
    ),
    INVITED: ({ invite }: { invite: ContributorInvite }) => (
      <Button
        isLoading={isGrantAccessLoading}
        disabled={!repoOwner || isGrantAccessLoading}
        onClick={() => handleCancelInviteClick(invite)}
        variant="primary-outline"
        className="!py-1 border-red-400 text-red-400 hover:bg-red-50"
      >
        Cancel Invite
      </Button>
    )
  }

  async function handleAcceptInviteClick() {
    setAcceptIsLoading(true)
    await acceptContributor()
    setAcceptIsLoading(false)
  }

  async function handleDeclineInviteClick() {
    //
    setIsRejectLoading(true)
    await rejectContributor()
    setIsRejectLoading(true)
  }

  const inviteActionsMapForContributor = {
    INVITED: () => (
      <div className="flex gap-2 items-center">
        <Button
          isLoading={isRejectLoading}
          disabled={isAcceptLoading || isRejectLoading}
          onClick={handleDeclineInviteClick}
          variant="primary-outline"
          className="!py-1 border-red-400 text-red-400 hover:bg-red-50"
        >
          Reject
        </Button>
        <Button
          isLoading={isAcceptLoading}
          disabled={isAcceptLoading || isRejectLoading}
          onClick={handleAcceptInviteClick}
          variant="primary-outline"
          className="!py-1"
        >
          Accept
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full border-b-[1px] border-[#cbc9f6] py-1">
        <h1 className="text-2xl text-liberty-dark-100">Repository Contributors</h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="w-[50%]">
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
              Invite new contributor
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                {...register('address')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  errors.address ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Arweave address"
                disabled={!repoOwner}
              />
              <Button
                isLoading={isLoading}
                disabled={!repoOwner || isLoading}
                onClick={handleSubmit(handleAddButtonClick)}
                variant="primary-solid"
              >
                Invite
              </Button>
            </div>
          </div>
          {errors.address && <p className="text-red-500 text-sm italic mt-2">{errors.address?.message}</p>}
        </div>
        <div className="flex flex-col border-gray-300 border-[1px] rounded-lg overflow-hidden bg-white">
          <div className="flex font-medium bg-gray-200 border-b-[1px] border-gray-300 text-gray-900 px-4 py-2 rounded-t-lg overflow-hidden">
            <div className="w-[50%]">Address</div>
            <div className="w-[50%]">Role</div>
          </div>
          {repo && (
            <div className="flex bg-gray-50 cursor-pointer hover:bg-primary-50 text-gray-600 hover:text-gray-900 items-center gap-4 py-[10px] px-4 border-b-[1px] border-gray-300 last:border-b-0">
              <div className="w-[50%]">{resolveUsernameOrShorten(repo.owner)}</div>
              <div className="w-[50%]">Owner</div>
            </div>
          )}
          {repo &&
            repo?.contributors?.map((address) => (
              <div className="flex bg-gray-50 cursor-pointer hover:bg-primary-50 text-gray-600 hover:text-gray-900 items-center gap-4 py-[10px] px-4 border-b-[1px] border-gray-300 last:border-b-0">
                <div className="w-[50%]">{resolveUsernameOrShorten(address)}</div>
                <div className="w-[50%]">Contributor</div>
              </div>
            ))}
        </div>
      </div>
      <div className="w-full border-b-[1px] border-[#cbc9f6] py-1">
        <h1 className="text-2xl text-liberty-dark-100">Invited Contributors</h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex min-h-[200px] flex-col border-gray-300 border-[1px] rounded-lg overflow-hidden bg-white">
          <div className="flex font-medium bg-gray-200 border-b-[1px] border-gray-300 text-gray-900 px-4 py-2 rounded-t-lg overflow-hidden">
            <div className="w-[60%]">Address</div>
            <div className="w-[25%]">Status</div>
            <div className="w-[25%]">Action</div>
          </div>

          {repo &&
            repo?.contributorInvites?.filter(filterContributorInvited).map((invite) => {
              const InviteActionComponent = inviteActionsMap[invite.status as keyof typeof inviteActionsMap]
              const ContributorInviteActionComponent =
                inviteActionsMapForContributor[invite.status as keyof typeof inviteActionsMapForContributor]
              return (
                <div className="flex bg-gray-50 cursor-pointer hover:bg-primary-50 text-gray-600 hover:text-gray-900 items-center gap-4 py-[10px] px-4 border-b-[1px] border-gray-300 last:border-b-0">
                  <div className="w-[60%]">{resolveUsername(invite.address)}</div>
                  <div className="w-[25%] capitalize">{invite.status.toLowerCase()}</div>
                  <div className="w-[25%] capitalize">
                    {repoOwner && InviteActionComponent && <InviteActionComponent invite={invite} />}
                    {address === invite.address && ContributorInviteActionComponent && (
                      <ContributorInviteActionComponent />
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
