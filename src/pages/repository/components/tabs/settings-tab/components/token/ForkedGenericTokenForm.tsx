import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

import DraggablePieChart from './DraggablePieChart'

const schema = yup.object().shape({
  tokenName: yup.string().required('Token name is required'),
  tokenTicker: yup
    .string()
    .required('Ticker is required')
    .matches(/^[A-Z]+$/, 'Must be uppercase letters and one word only'),
  denomination: yup.string().default('18').required('Denomination is required').matches(/^\d+$/, 'Must be a number'),
  totalSupply: yup
    .string()
    .default('1000000000')
    .required('Total supply is required')
    .matches(/^\d+$/, 'Must be a number'),
  tokenImage: yup.string().required('Image is required'),
  allocationForParentTokenHolders: yup
    .string()
    .required('Allocation for parent token holders is required')
    .matches(/^\d+$/, 'Must be a number')
})
export default function ForkedGenericTokenForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [address, selectedRepo, saveForkedImportTokenDetails] = useGlobalStore((state) => [
    state.authState.address,
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.saveForkedImportTokenDetails
  ])
  const {
    watch,
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors: tokenErrors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tokenName: selectedRepo?.token?.tokenName || '',
      tokenTicker: selectedRepo?.token?.tokenTicker || '',
      denomination: selectedRepo?.token?.denomination || '18',
      totalSupply: selectedRepo?.token?.totalSupply || '21000000',
      tokenImage: selectedRepo?.token?.tokenImage || '',
      allocationForParentTokenHolders: selectedRepo?.token?.allocationForParentTokenHolders || '20'
    }
  })

  const allocationForParentTokenHolders = watch('allocationForParentTokenHolders')
  useEffect(() => {
    const parsed = parseFloat(allocationForParentTokenHolders)
    if (!(parsed >= 0 && parsed <= 100)) {
      setError('allocationForParentTokenHolders', { message: 'Must be greater than 0 and less than or equal to 100' })
    } else {
      clearErrors('allocationForParentTokenHolders')
    }
  }, [allocationForParentTokenHolders])

  const handleSaveChanges = async (data: yup.InferType<typeof schema>) => {
    setIsSubmitting(true)
    await saveForkedImportTokenDetails(data)
    setIsSubmitting(false)
  }

  const repoOwner = selectedRepo?.owner === address
  return (
    <div className="flex gap-4 items-center">
      <div className="flex w-full gap-4 flex-col">
        <div className="w-[65%]">
          <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
            Token name
          </label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              {...register('tokenName')}
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                tokenErrors.tokenName ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="my-cool-repo"
              disabled={!repoOwner || selectedRepo?.decentralized}
            />
          </div>
          {tokenErrors.tokenName && (
            <p className="text-red-5000 text-sm italic mt-2">{tokenErrors.tokenName?.message}</p>
          )}
        </div>
        <div className="w-[65%]">
          <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
            Token Ticker
          </label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              {...register('tokenTicker')}
              className={clsx(
                'bg-white border-[1px] text-gray-9000 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                tokenErrors.tokenTicker ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="BTC"
              disabled={!repoOwner || selectedRepo?.decentralized}
            />
          </div>
          {tokenErrors.tokenTicker && (
            <p className="text-red-500 text-sm italic mt-2">{tokenErrors.tokenTicker?.message}</p>
          )}
        </div>
        <div className="w-[65%]">
          <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
            Denomination
          </label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              {...register('denomination')}
              className={clsx(
                'bg-white border-[1px] text-gray-9000 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                tokenErrors.denomination ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="BTC"
              disabled={!repoOwner || selectedRepo?.decentralized}
            />
          </div>
          {tokenErrors.denomination && (
            <p className="text-red-500 text-sm italic mt-2">{tokenErrors.denomination?.message}</p>
          )}
        </div>
        <div className="flex flex-col w-[65%]">
          <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
            Token Image
          </label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              {...register('tokenImage')}
              className={clsx(
                'bg-white border-[1px] text-gray-90 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                tokenErrors.tokenImage ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="https://arweave.net/TxID"
              disabled={!repoOwner || selectedRepo?.decentralized}
            />
          </div>
          {tokenErrors.tokenImage && (
            <p className="text-red-500 text-sm italic mt-2">{tokenErrors.tokenImage?.message}</p>
          )}
        </div>
        <div className="flex flex-col w-[65%]">
          <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
            Total Supply
          </label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              {...register('totalSupply')}
              className={clsx(
                'bg-white border-[1px] text-gray-90 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                tokenErrors.totalSupply ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="1000000000"
              disabled={!repoOwner || selectedRepo?.decentralized}
            />
          </div>
          {tokenErrors.totalSupply && (
            <p className="text-red-500 text-sm italic mt-2">{tokenErrors.totalSupply?.message}</p>
          )}
        </div>
        <div className="flex flex-col w-[65%]">
          <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
            Allocation for parent token holders (%)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              {...register('allocationForParentTokenHolders')}
              className={clsx(
                'bg-white border-[1px] text-gray-90 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                tokenErrors.allocationForParentTokenHolders ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="80%"
              disabled={!repoOwner || selectedRepo?.decentralized}
            />
          </div>
          {tokenErrors.allocationForParentTokenHolders && (
            <p className="text-red-500 text-sm italic mt-2">{tokenErrors.allocationForParentTokenHolders?.message}</p>
          )}
        </div>
        <Button
          disabled={Object.keys(tokenErrors).length > 0 || isSubmitting}
          isLoading={isSubmitting}
          onClick={handleSubmit(handleSaveChanges)}
          variant="primary-solid"
          className="w-fit h-10"
        >
          Save Changes
        </Button>
      </div>
      <div className="flex items-center flex-col w-full">
        <DraggablePieChart
          parentTokenHoldersAllocation={+allocationForParentTokenHolders}
          meAllocation={100 - +allocationForParentTokenHolders}
          onParentTokenHoldersAllocationChange={() => {}}
        />
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#0088FE' }}></div>
            <span className="text-sm text-gray-600">Parent Token Holders ({allocationForParentTokenHolders}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#56ADD9' }}></div>
            <span className="text-sm text-gray-600">You ({100 - +allocationForParentTokenHolders}%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
