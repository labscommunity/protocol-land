import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useState } from 'react'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaPlus } from 'react-icons/fa'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { useGlobalStore } from '@/stores/globalStore'
import { Allocation, RepoToken } from '@/types/repository'

const tokenSchema = yup
  .object({
    tokenName: yup.string().required('Token name is required'),
    tokenTicker: yup.string().required('Ticker is required'),
    denomination: yup.string().required('Denomination is required'),
    totalSupply: yup.string().required('Total supply is required'),
    tokenImage: yup.string().required('Image is required'),
    allocations: yup
      .array()
      .of(
        yup.object({
          address: yup.string().required('Wallet Address is required'),
          percentage: yup.string().required('Percentage is required')
        })
      )
      .required()
  })
  .required()

export default function Token() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRepo, isRepoOwner, saveRepoTokenDetails] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.isRepoOwner,
    state.repoCoreActions.saveRepoTokenDetails
  ])
  const {
    register,
    handleSubmit,
    control,
    formState: { errors: tokenErrors }
  } = useForm({
    resolver: yupResolver(tokenSchema),
    mode: 'onChange',
    defaultValues: {
      tokenName: selectedRepo?.token?.tokenName || '',
      tokenTicker: selectedRepo?.token?.tokenTicker || '',
      denomination: selectedRepo?.token?.denomination || '',
      totalSupply: selectedRepo?.token?.totalSupply || '',
      tokenImage: selectedRepo?.token?.tokenImage || '',
      allocations: selectedRepo?.token?.allocations || []
    }
  })

  const { fields, append, remove } = useFieldArray({
    name: 'allocations',
    control
  })
  React.useEffect(() => {
    if (fields.length === 0) {
      appendEmptyRecipient()
    }
  }, [fields])

  function appendEmptyRecipient() {
    append({
      address: '',
      percentage: ''
    })
  }

  async function handleSubmitClick(data: yup.InferType<typeof tokenSchema>) {
    if (!selectedRepo) return

    if (selectedRepo.decentralized) {
      toast.error('This repository is a decentralized repository. Cannot update token after this point.')
      return
    }

    setIsSubmitting(true)

    try {
      const updatedFields = getUpdatedFields(selectedRepo.token || {}, data)
      if (Object.keys(updatedFields).length === 0) {
        toast.success('No changes to update.')
        return
      }

      if (updatedFields.allocations && !validateAllocations(updatedFields.allocations)) {
        toast.error('Allocations must not exceed 100%')
        return
      }

      await saveRepoTokenDetails(updatedFields)
    } catch (error) {
      toast.error('Failed to save token.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDeleteAllocation(idx: number) {
    remove(idx)
  }

  function getUpdatedFields(originalData: Partial<RepoToken>, updatedData: Partial<RepoToken>): Partial<RepoToken> {
    const changes: Partial<RepoToken> = {}

    Object.keys(updatedData).forEach((key: string) => {
      const typedKey = key as keyof RepoToken

      if (!isInvalidInput(updatedData[typedKey], ['string', 'array'], true)) {
        if (Array.isArray(updatedData[typedKey]) && typedKey === 'allocations') {
          if (JSON.stringify(originalData[typedKey]) !== JSON.stringify(updatedData[typedKey])) {
            changes[typedKey] = updatedData[typedKey] as Allocation[]
          }
        } else if (originalData[typedKey] !== updatedData[typedKey] && typedKey !== 'allocations') {
          changes[typedKey] = updatedData[typedKey]
        }
      }
    })

    return changes
  }

  function validateAllocations(allocations: Allocation[]) {
    const percentage = allocations.reduce((acc, curr) => acc + parseInt(curr.percentage), 0)
    return percentage <= 100
  }

  const repoOwner = isRepoOwner()

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full border-b-[1px] border-gray-200 py-1">
        <h1 className="text-2xl text-gray-900">Token Settings</h1>
      </div>
      <div className="flex flex-col gap-4">
        <label htmlFor="token-name" className="block text-base font-medium text-gray-6000">
          General
        </label>
        <div className="flex w-full gap-4">
          <div className="w-[50%]">
            <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-6000">
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
                defaultValue={selectedRepo?.name}
                disabled={!repoOwner || selectedRepo?.decentralized}
              />
            </div>
            {tokenErrors.tokenName && (
              <p className="text-red-5000 text-sm italic mt-2">{tokenErrors.tokenName?.message}</p>
            )}
          </div>
          <div className="w-[50%]">
            <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-6000">
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
        </div>
        <div className="flex w-full gap-4">
          <div className="w-[50%]">
            <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-6000">
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
                placeholder="6"
                disabled={!repoOwner || selectedRepo?.decentralized}
              />
            </div>
            {tokenErrors.denomination && (
              <p className="text-red-500 text-sm italic mt-2">{tokenErrors.denomination?.message}</p>
            )}
          </div>
          <div className="w-[50%]">
            <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-6000">
              Total Supply
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                {...register('totalSupply')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  tokenErrors.totalSupply ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="21000000"
                disabled={!repoOwner || selectedRepo?.decentralized}
              />
            </div>
            {tokenErrors.totalSupply && (
              <p className="text-red-500 text-sm italic mt-2">{tokenErrors.totalSupply?.message}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col w-full">
          <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-6000">
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
        <div className="flex flex-col w-full">
          <div className="w-full flex flex-col gap-3">
            <label htmlFor="token-name" className="block mb-1 text-base font-medium text-gray-6000">
              Allocations
            </label>
            <div className="flex flex-col items-start gap-4 w-full">
              {fields.map((field, idx) => {
                return (
                  <div key={field.id} className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-4">
                      <h1 className="text-gray-6000 text-sm font-medium">Allocation #{idx + 1}</h1>
                      {fields.length > 1 && (
                        <span
                          onClick={() => handleDeleteAllocation(idx)}
                          className="text-primary-700 text-sm font-medium !p-0 flex items-center cursor-pointer hover:underline"
                        >
                          Delete
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 items-start w-full">
                      <div className="w-[50%]">
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            {...register(`allocations.${idx}.address`)}
                            className={clsx(
                              'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                              'border-gray-300'
                            )}
                            placeholder="Arweave Address"
                          />
                        </div>
                        {tokenErrors.allocations &&
                          tokenErrors.allocations[idx] &&
                          tokenErrors.allocations![idx]?.address && (
                            <p className="text-red-500 text-sm italic mt-2">
                              {tokenErrors?.allocations![idx]?.address?.message}
                            </p>
                          )}
                      </div>
                      <div className="w-[50%]">
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            {...register(`allocations.${idx}.percentage`)}
                            className={clsx(
                              'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                              'border-gray-300'
                            )}
                            placeholder="Percentage %"
                          />
                        </div>
                        {tokenErrors.allocations &&
                          tokenErrors.allocations[idx] &&
                          tokenErrors.allocations![idx]?.percentage && (
                            <p className="text-red-500 text-sm italic mt-2">
                              {tokenErrors?.allocations![idx]?.percentage?.message}
                            </p>
                          )}
                      </div>
                    </div>
                    {idx === fields.length - 1 && (
                      <div className="w-full flex items-center gap-4">
                        <Button
                          onClick={appendEmptyRecipient}
                          variant="link"
                          className="text-primary-600 text-sm font-medium"
                        >
                          <FaPlus className="mr-1" /> Add Entry
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            isLoading={isSubmitting}
            disabled={!repoOwner || selectedRepo?.decentralized}
            onClick={handleSubmit(handleSubmitClick)}
            variant="primary-solid"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
