import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Switch, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { Fragment, useState } from 'react'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaPlus } from 'react-icons/fa'
import { HiChevronUpDown } from 'react-icons/hi2'
import { IoCheckmark } from 'react-icons/io5'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { fetchAllUserTokens } from '@/helpers/wallet/fetchAllTokens'
import { useGlobalStore } from '@/stores/globalStore'
import { Allocation, RepoToken, type Token } from '@/types/repository'

import LiquidityPoolTokenSetting from './LiquidityPoolTokenSetting'

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
    allocations: yup
      .array()
      .of(
        yup.object({
          address: yup
            .string()
            .required('Wallet Address is required')
            .matches(/^[a-z0-9-_]{43}$/i, 'Must be a valid Arweave address'),
          percentage: yup.string().required('Percentage is required').matches(/^\d+$/, 'Must be a number')
        })
      )
      .required()
  })
  .required()

// const poolSchema = yup.object({
//   quoteToken: yup.object({
//     ticker: yup.string().required('Ticker is required'),
//     processId: yup.string().required('Process ID is required'),
//     logo: yup.string().required('Logo is required'),
//     name: yup.string().required('Name is required'),
//     denomination: yup.number().required('Denomination is required')
//   }),
//   quoteAmount: yup.string().required('Quote amount is required'),
//   baseToken: yup.object({
//     ticker: yup.string().required('Ticker is required'),
//     processId: yup.string().required('Process ID is required'),
//     logo: yup.string().required('Logo is required'),
//     name: yup.string().required('Name is required'),
//     denomination: yup.number().required('Denomination is required')
//   }),
//   baseAmount: yup.string().required('Base amount is required')
// })

const USDA_TST = {
  tokenName: 'Astro USD (Test)',
  tokenTicker: 'USDA-TST',
  processId: 'GcFxqTQnKHcr304qnOcq00ZqbaYGDn4Wbb0DHAM-wvU',
  denomination: '12',
  tokenImage: 'K8nurc9H0_ZQm17jbs3ryEs6MrlX-oIK_krpprWlQ-Q'
}

export default function Token() {
  const [isTokenListLoading, setIsTokenListLoading] = useState(true)
  const [tokenList, setTokenList] = useState<(typeof USDA_TST)[]>([USDA_TST])
  const [selectedToken, setSelectedToken] = useState<typeof USDA_TST>(USDA_TST)
  const [liquidityPoolEnabled, setLiquidityPoolEnabled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRepo, isRepoOwner, saveRepoTokenDetails, saveRepoLiquidityPoolDetails, disableRepoLiquidityPool] =
    useGlobalStore((state) => [
      state.repoCoreState.selectedRepo.repo,
      state.repoCoreActions.isRepoOwner,
      state.repoCoreActions.saveRepoTokenDetails,
      state.repoCoreActions.saveRepoLiquidityPoolDetails,
      state.repoCoreActions.disableRepoLiquidityPool
    ])
  const {
    register,
    handleSubmit,
    control,
    formState: { errors: tokenErrors },
    getValues
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
    fetchAllUserTokens().then((tokens) => {
      setTokenList(tokens)
      setIsTokenListLoading(false)
    })
  }, [])

  React.useEffect(() => {
    if (fields.length === 0) {
      appendEmptyRecipient()
    }
  }, [fields])

  React.useEffect(() => {
    if (selectedRepo?.liquidityPool) {
      setLiquidityPoolEnabled(true)
      setSelectedToken(selectedRepo.liquidityPool.quoteToken)
    }
  }, [selectedRepo])

  function appendEmptyRecipient() {
    append({
      address: '',
      percentage: ''
    })
  }

  function hasAllKeysAndValues(obj: Record<string, any>): boolean {
    const keys = ['tokenName', 'tokenTicker', 'denomination', 'tokenImage']
    return keys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== null && obj[key] !== undefined && obj[key] !== ''
    )
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
      let liquidityPool = null
      if (liquidityPoolEnabled) {
        const validTokenSettings = hasAllKeysAndValues(data || {})

        if (!validTokenSettings) {
          toast.error('Token Settings Incomplete')
          return
        }

        const validQuoteTokenSettings = hasAllKeysAndValues(selectedToken)

        if (!validQuoteTokenSettings) {
          toast.error('Quote Token Settings Incomplete')
          return
        }

        liquidityPool = {
          quoteToken: selectedToken,
          baseToken: {
            tokenName: data.tokenName || '',
            tokenTicker: data.tokenTicker || '',
            processId: selectedRepo?.token?.processId || '',
            denomination: data.denomination || '',
            tokenImage: data.tokenImage || ''
          }
        }

        await saveRepoLiquidityPoolDetails(liquidityPool)
      }

      if (!liquidityPoolEnabled && selectedRepo.liquidityPool) {
        await disableRepoLiquidityPool()
      }

      if (Object.keys(updatedFields).length === 0) {
        toast.success('Changes are in sync.')
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
    <div className="flex flex-col gap-4 pb-40">
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
        </div>

        <div className="flex flex-col w-full">
          <div className="w-full flex flex-col gap-3">
            <label htmlFor="token-name" className="block mb-1 text-base font-medium text-gray-6000">
              Liquidity Pool
            </label>
            <div className="flex items-center gap-2">
              <Switch
                checked={liquidityPoolEnabled}
                disabled={!repoOwner || selectedRepo?.decentralized}
                onChange={(checked) => {
                  setLiquidityPoolEnabled(checked)
                }}
                className={`${
                  liquidityPoolEnabled ? 'bg-primary-700' : 'bg-gray-300'
                } relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
              >
                <span
                  aria-hidden="true"
                  className={`${liquidityPoolEnabled ? 'translate-x-6' : 'translate-x-0'}
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
              <span>{liquidityPoolEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>

            {selectedRepo?.liquidityPoolId && <LiquidityPoolTokenSetting poolId={selectedRepo?.liquidityPoolId} />}

            {!selectedRepo?.liquidityPoolId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: liquidityPoolEnabled ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className={clsx('flex flex-col w-full mt-4', {
                  hidden: !liquidityPoolEnabled
                })}
              >
                <div className="flex flex-col items-start gap-4 w-full">
                  <div className="flex flex-col w-full">
                    <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
                      Base Token
                    </label>
                    <div className="flex items-center gap-4">
                      {hasAllKeysAndValues(getValues() || {}) === true ? (
                        <div className="w-72">
                          <Listbox disabled={true}>
                            <div className="relative mt-1">
                              <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                <span className="block truncate">{getValues().tokenTicker}</span>
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
                                  {tokenList.map((token) => (
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
                                          <span
                                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                          >
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
                      ) : (
                        <span className="text-sm text-yellow-500 font-medium">Token Settings Incomplete</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col w-full">
                    <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-6000">
                      Quote Token
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-72">
                        <Listbox value={selectedToken} onChange={setSelectedToken}>
                          <div className="relative mt-1">
                            <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                              <span className="block truncate">
                                {isTokenListLoading ? 'Loading...' : selectedToken.tokenTicker}
                              </span>
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
                                {tokenList.map((token) => (
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
                </div>
              </motion.div>
            )}
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
