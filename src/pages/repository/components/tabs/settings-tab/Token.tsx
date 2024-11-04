import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { Fragment, useState } from 'react'
import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
// import { FaPlus } from 'react-icons/fa'
import { HiChevronUpDown } from 'react-icons/hi2'
import { IoCheckmark } from 'react-icons/io5'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { spawnBondingCurveProcess } from '@/lib/decentralize'
// import { fetchAllUserTokens } from '@/helpers/wallet/fetchAllTokens'
import { useGlobalStore } from '@/stores/globalStore'
import { Allocation, BondingCurve, RepoToken, type Token } from '@/types/repository'

import LiquidityPoolTokenSetting from './LiquidityPoolTokenSetting'

const CURVE_TYPES = ['Exponential-Like', 'Linear', 'Exponential', 'Quadratic']

const tokenSchema = yup
  .object({
    tokenName: yup.string().required('Token name is required'),
    tokenTicker: yup
      .string()
      .required('Ticker is required')
      .matches(/^[A-Z]+$/, 'Must be uppercase letters and one word only'),
    denomination: yup.string().required('Denomination is required').matches(/^\d+$/, 'Must be a number'),
    totalSupply: yup.string().required('Total supply is required').matches(/^\d+$/, 'Must be a number'),
    tokenImage: yup.string().required('Image is required'),
    fundingGoal: yup.string().default('50000').matches(/^\d+$/, 'Must be a number')
    // allocations: yup
    //   .array()
    //   .of(
    //     yup.object({
    //       address: yup
    //         .string()
    //         .required('Wallet Address is required')
    //         .matches(/^[a-z0-9-_]{43}$/i, 'Must be a valid Arweave address'),
    //       percentage: yup.string().required('Percentage is required').matches(/^\d+$/, 'Must be a number')
    //     })
    //   )
    //   .required()
  })
  .required()

const USDA_TST = {
  tokenName: 'USDA Mock',
  tokenTicker: 'TUSDA',
  processId: 'b87Jd4usKGyMjovbNeX4P3dcvkC4mrtBZ5HxW_ENtn4',
  denomination: '12',
  tokenImage: 'TPkPIvnvWuyd-hv8J1IAdUlb8aii00Z7vjwMBk_kp0M'
}
const RESERVE_TOKENS = [USDA_TST]

export default function Token() {
  const [selectedCurveType] = useState(CURVE_TYPES[0])
  // const [isTokenListLoading, setIsTokenListLoading] = useState(true)
  // const [tokenList, setTokenList] = useState<(typeof USDA_TST)[]>([USDA_TST])
  const [selectedToken, setSelectedToken] = useState<typeof USDA_TST>(USDA_TST)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRepo, isRepoOwner, saveRepoTokenDetails, saveRepoBondingCurveDetails] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.isRepoOwner,
    state.repoCoreActions.saveRepoTokenDetails,
    state.repoCoreActions.saveRepoBondingCurveDetails
  ])
  const {
    register,
    handleSubmit,
    // control,
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
      fundingGoal: selectedRepo?.bondingCurve?.fundingGoal || '50000'
      // allocations: selectedRepo?.token?.allocations || []
    }
  })

  // const { fields, append, remove } = useFieldArray({
  //   name: 'allocations',
  //   control
  // })

  // React.useEffect(() => {
  //   fetchAllUserTokens().then((tokens) => {
  //     // setTokenList(tokens)
  //     setIsTokenListLoading(false)
  //   })
  // }, [])

  // React.useEffect(() => {
  //   if (fields.length === 0) {
  //     appendEmptyRecipient()
  //   }
  // }, [fields])

  React.useEffect(() => {
    if (selectedRepo?.bondingCurve) {
      setSelectedToken(selectedRepo.bondingCurve.reserveToken)
    }
  }, [selectedRepo])

  // function appendEmptyRecipient() {
  //   append({
  //     address: '',
  //     percentage: ''
  //   })
  // }

  // function hasAllKeysAndValues(obj: Record<string, any>): boolean {
  //   const keys = ['tokenName', 'tokenTicker', 'denomination', 'tokenImage']
  //   return keys.every(
  //     (key) =>
  //       Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== null && obj[key] !== undefined && obj[key] !== ''
  //   )
  // }

  async function handleSubmitClick(data: yup.InferType<typeof tokenSchema>) {
    if (!selectedRepo) return

    if (selectedRepo.decentralized) {
      toast.error('This repository is a decentralized repository. Cannot update token after this point.')
      return
    }

    setIsSubmitting(true)

    try {
      const updatedFields = getUpdatedFields(selectedRepo.token || {}, data)

      if (!selectedRepo?.bondingCurve || !selectedRepo?.bondingCurve?.processId) {
        //
      }
      const bondingCurve: BondingCurve = {
        fundingGoal: data.fundingGoal || '50000',
        reserveToken: selectedToken
      }
      if (!selectedRepo?.bondingCurve?.processId) {
        const pid = await spawnBondingCurveProcess(data.tokenName)
        bondingCurve.processId = pid
      }

      await saveRepoBondingCurveDetails(bondingCurve)

      if (Object.keys(updatedFields).length === 0) {
        toast.success('Changes are in sync.')
        return
      }

      // if (updatedFields.allocations && !validateAllocations(updatedFields.allocations)) {
      //   toast.error('Allocations must not exceed 100%')
      //   return
      // }

      await saveRepoTokenDetails(updatedFields)
    } catch (error) {
      toast.error('Failed to save token.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // function handleDeleteAllocation(idx: number) {
  //   remove(idx)
  // }

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

  // function validateAllocations(allocations: Allocation[]) {
  //   const percentage = allocations.reduce((acc, curr) => acc + parseInt(curr.percentage), 0)
  //   return percentage <= 100
  // }

  const repoOwner = isRepoOwner()

  return (
    <div className="flex flex-col gap-4 pb-40">
      <div className="w-full border-b-[1px] border-gray-200 py-1">
        <h1 className="text-2xl text-gray-900">Token Settings</h1>
      </div>
      <div className="flex flex-col gap-4">
        <label htmlFor="token-name" className="block text-base font-medium text-gray-600">
          General
        </label>
        <div className="flex w-full gap-4">
          <div className="w-[50%]">
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
                defaultValue={selectedRepo?.name}
                disabled={!repoOwner || selectedRepo?.decentralized}
              />
            </div>
            {tokenErrors.tokenName && (
              <p className="text-red-5000 text-sm italic mt-2">{tokenErrors.tokenName?.message}</p>
            )}
          </div>
          <div className="w-[50%]">
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
        </div>
        <div className="flex w-full gap-4">
          <div className="w-[50%]">
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
                placeholder="6"
                disabled={!repoOwner || selectedRepo?.decentralized}
              />
            </div>
            {tokenErrors.denomination && (
              <p className="text-red-500 text-sm italic mt-2">{tokenErrors.denomination?.message}</p>
            )}
          </div>
          <div className="w-[50%]">
            <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
              Max Supply
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
        {/* <div className="flex flex-col w-full">
          <div className="w-full flex flex-col gap-3">
            <label htmlFor="token-name" className="block mb-1 text-base font-medium text-gray-6000">
              Contributor Allocations
            </label>
            <div className="flex flex-col items-start gap-4 w-full">
              {fields.map((field, idx) => {
                return (
                  <div key={field.id} className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-4">
                      <h1 className="text-gray-6000 text-sm font-medium">Allocation #{idx + 1}</h1>
                      {fields.length > 1 && !selectedRepo?.decentralized && repoOwner && (
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
                            disabled={!repoOwner || selectedRepo?.decentralized}
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
                            disabled={!repoOwner || selectedRepo?.decentralized}
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
                          disabled={!repoOwner || selectedRepo?.decentralized}
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
        </div> */}

        <div className="flex flex-col w-full">
          <div className="w-full flex flex-col gap-3">
            <label htmlFor="token-name" className="block mb-1 text-base font-medium text-gray-600">
              Bonding Curve
            </label>

            {selectedRepo?.liquidityPoolId && <LiquidityPoolTokenSetting poolId={selectedRepo?.liquidityPoolId} />}

            {!selectedRepo?.liquidityPoolId && (
              <div className="flex flex-col items-start gap-4 w-full">
                <div className="flex flex-col w-full">
                  <label htmlFor="curve-type" className="block mb-1 text-sm font-medium text-gray-600">
                    Curve Type
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-72">
                      <Listbox disabled={true}>
                        <div className="relative mt-1">
                          <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                            <span className="block truncate">{selectedCurveType}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <HiChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </ListboxButton>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                              {CURVE_TYPES.map((curveType) => (
                                <ListboxOption
                                  key={curveType}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-primary-100' : 'text-gray-900'
                                    }`
                                  }
                                  value={curveType}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {curveType}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-700">
                                          <IoCheckmark className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </ListboxOption>
                              ))}
                            </ListboxOptions>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full">
                  <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
                    Reserve Token
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-72">
                      <Listbox disabled={true} value={selectedToken} onChange={setSelectedToken}>
                        <div className="relative mt-1">
                          <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                            <span className="block truncate">{selectedToken.tokenTicker}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <HiChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </ListboxButton>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                              {RESERVE_TOKENS.map((token) => (
                                <ListboxOption
                                  key={token.processId}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-primary-100' : 'text-gray-900'
                                    }`
                                  }
                                  value={token}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {token.tokenTicker}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-700">
                                          <IoCheckmark className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </ListboxOption>
                              ))}
                            </ListboxOptions>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                  </div>
                </div>

                <div className="w-72">
                  <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
                    Funding Goal ({selectedToken.tokenTicker})
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      {...register('fundingGoal')}
                      className={clsx(
                        'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                        tokenErrors.fundingGoal ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="50000"
                      disabled={!repoOwner || selectedRepo?.decentralized}
                    />
                  </div>
                  {tokenErrors.fundingGoal && (
                    <p className="text-red-500 text-sm italic mt-2">{tokenErrors.fundingGoal?.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <Button
            isLoading={isSubmitting}
            disabled={!repoOwner || selectedRepo?.decentralized || isSubmitting}
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
