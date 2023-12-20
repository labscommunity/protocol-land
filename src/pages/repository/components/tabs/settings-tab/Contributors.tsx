import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

const addressSchema = yup
  .object({
    address: yup
      .string()
      .required('Contributor address is required')
      .matches(/[a-z0-9-_]{43}/i, 'Invalid address')
  })
  .required()

export default function Contributors() {
  const [repo, inviteContributor, isRepoOwner] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.inviteContributor,
    state.repoCoreActions.isRepoOwner
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
      } else {
        await inviteContributor(data.address)
        resetField('address')
        toast.success('Successfully added a contributor')
      }
    }
  }

  const repoOwner = isRepoOwner()

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
              <Button disabled={!repoOwner} onClick={handleSubmit(handleAddButtonClick)} variant="primary-solid">
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
              <div className="w-[50%]">{repo.owner}</div>
              <div className="w-[50%]">Owner</div>
            </div>
          )}
          {repo &&
            repo?.contributors?.map((address) => (
              <div className="flex bg-gray-50 cursor-pointer hover:bg-primary-50 text-gray-600 hover:text-gray-900 items-center gap-4 py-[10px] px-4 border-b-[1px] border-gray-300 last:border-b-0">
                <div className="w-[50%]">{address}</div>
                <div className="w-[50%]">Contributor</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
