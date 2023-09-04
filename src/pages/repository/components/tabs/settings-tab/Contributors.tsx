import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { addContributor } from '@/lib/git'
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
  const [repo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])
  const {
    register,
    handleSubmit,
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
        await addContributor(data.address, repo.id)
        toast.success('Successfully added a contributor')
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full border-b-[1px] border-[#cbc9f6] py-1">
        <h1 className="text-2xl text-liberty-dark-100">Repository Contributors</h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="w-[50%]">
            <label htmlFor="title" className="block mb-1 text-md font-medium text-liberty-dark-100">
              Add new contributor
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                {...register('address')}
                className={clsx(
                  'bg-gray-50 border  text-liberty-dark-100 text-md rounded-lg focus:ring-liberty-dark-50 focus:border-liberty-dark-50 block w-full p-2.5',
                  errors.address ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Arweave address"
              />
              <Button onClick={handleSubmit(handleAddButtonClick)} className="rounded-full " variant="solid">
                Add
              </Button>
            </div>
          </div>
          {errors.address && <p className="text-red-500 text-sm italic mt-2">{errors.address?.message}</p>}
        </div>
        <div className="flex flex-col">
          <div className="flex font-medium bg-[#5E70AB] px-4 py-2 text-white rounded-t-xl overflow-hidden">
            <div className="w-[50%]">Address</div>
            <div className="w-[50%]">Role</div>
          </div>
          {repo && (
            <div className="flex bg-white cursor-pointer hover:bg-liberty-light-300 text-liberty-dark-100 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-600 last:border-b-0">
              <div className="w-[50%]">{repo.owner}</div>
              <div className="w-[50%]">Owner</div>
            </div>
          )}
          {repo &&
            repo?.contributors?.map((address) => (
              <div className="flex bg-white cursor-pointer hover:bg-liberty-light-300 text-liberty-dark-100 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-600 last:border-b-0">
                <div className="w-[50%]">{address}</div>
                <div className="w-[50%]">Contributor</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
