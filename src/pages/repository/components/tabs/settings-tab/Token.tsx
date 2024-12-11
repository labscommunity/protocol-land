import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Switch, Transition } from '@headlessui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { Fragment, useState } from 'react'
import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaCopy } from 'react-icons/fa'
// import { FaPlus } from 'react-icons/fa'
import { HiChevronUpDown } from 'react-icons/hi2'
import { IoCheckmark } from 'react-icons/io5'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
// import { isInvalidInput } from '@/helpers/isInvalidInput'
// import { spawnBondingCurveProcess } from '@/lib/decentralize'
import { CurveStep, CurveType, generateSteps, generateTableData } from '@/lib/discrete-bonding-curve/curve'
// import { fetchAllUserTokens } from '@/helpers/wallet/fetchAllTokens'
import { useGlobalStore } from '@/stores/globalStore'
import { RepoLiquidityPoolToken, type Token } from '@/types/repository'

import CurveChart from './CurveChart'

const CURVE_TYPES: CurveType[] = ['EXPONENTIAL', 'LINEAR', 'FLAT', 'LOGARITHMIC']
const DEFAULT_TOTAL_SUPPLY = '1000000'
const DEFAULT_INITIAL_BUY_PRICE = '0.001'
const DEFAULT_FINAL_BUY_PRICE = '0.1'
const DEFAULT_LP_ALLOCATION = (parseInt(DEFAULT_TOTAL_SUPPLY) * 0.2).toString()
const DEFAULT_DENOMINATION = '18'
const DEFAULT_STEP_COUNT = '10'

const tokenSchema = yup
  .object({
    tokenName: yup.string().required('Token name is required'),
    tokenTicker: yup
      .string()
      .required('Ticker is required')
      .matches(/^[A-Z]+$/, 'Must be uppercase letters and one word only'),
    denomination: yup
      .string()
      .default(DEFAULT_DENOMINATION)
      .required('Denomination is required')
      .matches(/^\d+$/, 'Must be a number'),
    totalSupply: yup
      .string()
      .default(DEFAULT_TOTAL_SUPPLY)
      .required('Total supply is required')
      .matches(/^\d+$/, 'Must be a number'),
    tokenImage: yup.string().required('Image is required'),
    initialPrice: yup
      .string()
      .default(DEFAULT_INITIAL_BUY_PRICE)
      .matches(/^\d+(\.\d+)?$/, 'Must be a number or a decimal')
      .required('Initial buy price is required'),
    finalPrice: yup
      .string()
      .default(DEFAULT_FINAL_BUY_PRICE)
      .matches(/^\d+(\.\d+)?$/, 'Must be a number or a decimal')
      .required('Final buy price is required'),
    lpAllocation: yup.string().default(DEFAULT_LP_ALLOCATION).matches(/^\d+$/, 'Must be a number'),
    stepCount: yup.string().default(DEFAULT_STEP_COUNT).matches(/^\d+$/, 'Must be a number'),
    curveType: yup.string().default(CURVE_TYPES[0]),
    socialLink: yup.string()
  })
  .required()

// const USDA_TST = {
//   tokenName: ' MUSDAock',
//   tokenTicker: 'TUSDA',
//   processId: 'b87Jd4usKGyMjovbNeX4P3dcvkC4mrtBZ5HxW_ENtn4',
//   denomination: '12',
//   tokenImage: 'TPkPIvnvWuyd-hv8J1IAdUlb8aii00Z7vjwMBk_kp0M'
// }
const MOCK_USDA = {
  tokenName: 'USDA Mock',
  tokenTicker: 'TUSDA',
  processId: 'b87Jd4usKGyMjovbNeX4P3dcvkC4mrtBZ5HxW_ENtn4',
  denomination: '12',
  tokenImage: 'TPkPIvnvWuyd-hv8J1IAdUlb8aii00Z7vjwMBk_kp0M'
}
// const QAR = {
//   tokenName: 'Q Arweave',
//   tokenTicker: 'qAR',
//   // processId: 'b87Jd4usKGyMjovbNeX4P3dcvkC4mrtBZ5HxW_ENtn4',
//   processId: 'NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8',
//   denomination: '12',
//   tokenImage: '26yDr08SuwvNQ4VnhAfV4IjJcOOlQ4tAQLc1ggrCPu0'
// }
const RESERVE_TOKENS = [MOCK_USDA]

export default function Token() {
  const [customBondingCurveEnabled, setCustomBondingCurveEnabled] = useState(false)
  const [tvl, setTvl] = useState(0)
  const [baseAssetPriceUSD, setBaseAssetPriceUSD] = useState(0)
  const [potentialMarketCap, setPotentialMarketCap] = useState(0)
  const [curveSteps, setCurveSteps] = useState<CurveStep[]>([])
  const [selectedCurveType, setSelectedCurveType] = useState<string>(CURVE_TYPES[0])
  console.log({ baseAssetPriceUSD })
  // const [isTokenListLoading, setIsTokenListLoading] = useState(true)
  // const [tokenList, setTokenList] = useState<(typeof USDA_TST)[]>([USDA_TST])
  const [selectedToken, setSelectedToken] = useState<RepoLiquidityPoolToken>(MOCK_USDA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRepo, isRepoOwner, saveRepoTokenDetails] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.isRepoOwner,
    state.repoCoreActions.saveRepoTokenDetails
  ])
  const {
    register,
    handleSubmit,
    watch,
    // control,
    formState: { errors: tokenErrors }
  } = useForm({
    resolver: yupResolver(tokenSchema),
    mode: 'onChange',
    defaultValues: {
      tokenName: selectedRepo?.token?.tokenName || '',
      tokenTicker: selectedRepo?.token?.tokenTicker || '',
      denomination: selectedRepo?.token?.denomination || DEFAULT_DENOMINATION,
      totalSupply: selectedRepo?.token?.totalSupply || DEFAULT_TOTAL_SUPPLY,
      tokenImage: selectedRepo?.token?.tokenImage || '',
      initialPrice: selectedRepo?.bondingCurve?.initialPrice || DEFAULT_INITIAL_BUY_PRICE,
      finalPrice: selectedRepo?.bondingCurve?.finalPrice || DEFAULT_FINAL_BUY_PRICE,
      lpAllocation: selectedRepo?.bondingCurve?.lpAllocation || DEFAULT_LP_ALLOCATION,
      stepCount: selectedRepo?.bondingCurve?.stepCount || DEFAULT_STEP_COUNT,
      curveType: selectedRepo?.bondingCurve?.curveType || CURVE_TYPES[0],
      socialLink: selectedRepo?.token?.socialLink || ''
    }
  })

  const initialBuyPrice = watch('initialPrice')
  const finalBuyPrice = watch('finalPrice')
  const totalSupply = watch('totalSupply')

  React.useEffect(() => {
    if (+totalSupply > 0 && parseFloat(finalBuyPrice) > 0) {
      setPotentialMarketCap(+totalSupply * parseFloat(finalBuyPrice))
    }
  }, [totalSupply, finalBuyPrice])

  React.useEffect(() => {
    calculateCurveSteps()
  }, [selectedCurveType, initialBuyPrice, finalBuyPrice, totalSupply])

  React.useEffect(() => {
    setTvl(+generateTableData(curveSteps).totalTVL.toPrecision(12))
  }, [curveSteps])

  React.useEffect(() => {
    if (selectedRepo?.bondingCurve) {
      setSelectedToken(selectedRepo.bondingCurve.reserveToken)
    }
  }, [selectedRepo])

  React.useEffect(() => {
    fetchBaseAssetPriceUSD()
  }, [selectedToken])

  async function handleSubmitClick(data: yup.InferType<typeof tokenSchema>) {
    if (!selectedRepo) return

    if (selectedRepo.decentralized) {
      toast.error('This repository is a decentralized repository. Cannot update token after this point.')
      return
    }

    setIsSubmitting(true)

    try {
      // const combinedData = { ...(selectedRepo.token || {}), ...selectedRepo.bondingCurve }
      // const updatedFields = getUpdatedFields(combinedData, data)

      // if (!selectedRepo?.bondingCurve?.processId) {
      //   const pid = await spawnBondingCurveProcess(data.tokenName)

      //   bondingCurve.processId = pid
      // }
      console.log({ data })
      // await saveRepoBondingCurveDetails(bondingCurve)

      // if (Object.keys(updatedFields).length === 0) {
      //   toast.success('Changes are already in sync.')
      //   return
      // }

      await saveRepoTokenDetails({ ...data, reserveToken: selectedToken })
    } catch (error) {
      toast.error('Failed to save token.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function fetchBaseAssetPriceUSD() {
    if (!selectedToken) return
    const token = selectedToken

    if (token.tokenTicker === 'TUSDA') {
      setBaseAssetPriceUSD(1)

      return
    }

    try {
      const response = await fetch('https://api.redstone.finance/prices?symbol=AR&provider=redstone-rapid&limit=1')
      const data = await response.json()
      setBaseAssetPriceUSD(data[0].value)
    } catch (error) {
      console.error('Failed to fetch AR price:', error)
      setBaseAssetPriceUSD(0)
    }
  }

  async function calculateCurveSteps() {
    const steps = generateSteps({
      reserveToken: selectedToken,
      curveData: {
        curveType: selectedCurveType,
        initialPrice: parseFloat(initialBuyPrice || '0.0000001'),
        finalPrice: parseFloat(selectedCurveType === 'FLAT' ? initialBuyPrice : finalBuyPrice || '0.01'),
        maxSupply: parseInt(totalSupply || '1000000'),
        lpAllocation: parseInt(totalSupply || '1000000') * 0.2,
        stepCount: 10
      }
    })

    setCurveSteps(steps.stepData)
  }

  // function getUpdatedFields(
  //   originalData: Partial<yup.InferType<typeof tokenSchema>>,
  //   updatedData: Partial<yup.InferType<typeof tokenSchema>>
  // ): Partial<yup.InferType<typeof tokenSchema>> {
  //   const changes: Partial<yup.InferType<typeof tokenSchema>> = {}

  //   Object.keys(updatedData).forEach((key: string) => {
  //     const typedKey = key as keyof yup.InferType<typeof tokenSchema>

  //     if (!isInvalidInput(updatedData[typedKey], ['string'], true)) {
  //       if (originalData[typedKey] !== updatedData[typedKey]) {
  //         changes[typedKey] = updatedData[typedKey]
  //       }
  //     }
  //   })

  //   return changes
  // }

  const repoOwner = isRepoOwner()

  return (
    <div className="flex flex-col gap-4 pb-40">
      <div className="w-full border-b-[1px] border-gray-200 py-1">
        <h1 className="text-2xl text-gray-900">Token Settings</h1>
      </div>
      <div className="w-fit">
        <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
          Token Process ID
        </label>
        {selectedRepo?.token?.processId && (
          <div className="flex items-center gap-4 bg-gray-200 py-2 px-4 rounded-md text-gray-600">
            {selectedRepo?.token?.processId}
            <div
              onClick={() => {
                navigator.clipboard.writeText(selectedRepo?.token?.processId || '')
                toast.success('Copied to clipboard')
              }}
              className="flex items-center gap-4 cursor-pointer hover:text-gray-900"
            >
              <FaCopy />
            </div>
          </div>
        )}
        {!selectedRepo?.token?.processId && <p className="text-gray-600 text-sm">No process ID yet.</p>}
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <label htmlFor="token-name" className="block text-xl font-medium text-gray-600">
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
          <div className="flex flex-col w-[50%]">
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
          <div className="flex flex-col w-[50%]">
            <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
              Website / Social Link
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                {...register('socialLink')}
                className={clsx(
                  'bg-white border-[1px] text-gray-90 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  tokenErrors.socialLink ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="https://arweave.net/TxID"
                disabled={!repoOwner || selectedRepo?.decentralized}
              />
            </div>
            {tokenErrors.socialLink && (
              <p className="text-red-500 text-sm italic mt-2">{tokenErrors.socialLink?.message}</p>
            )}
          </div>
          {/* <div className="w-[50%]">
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
                disabled={true}
                // disabled={!repoOwner || selectedRepo?.decentralized}
              />
            </div>
            {tokenErrors.denomination && (
              <p className="text-red-500 text-sm italic mt-2">{tokenErrors.denomination?.message}</p>
            )}
          </div> */}
        </div>

        <div className="flex items-center gap-4 mt-4">
          <Switch
            checked={customBondingCurveEnabled}
            onChange={setCustomBondingCurveEnabled}
            className={`${
              customBondingCurveEnabled ? 'bg-primary-700' : 'bg-gray-300'
            } relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
          >
            <span
              aria-hidden="true"
              className={`${customBondingCurveEnabled ? 'translate-x-6' : 'translate-x-0'}
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
          <span>Advanced Options</span>
        </div>

        <AnimatePresence>
          {customBondingCurveEnabled && (
            <motion.div
              // initial={{ opacity: 1 }}
              // animate={{ opacity: 1 }}
              // transition={{ duration: 0.4 }}
              key={'advanced-options'}
              exit={{ opacity: 0 }}
              className="flex flex-col w-full mt-4"
            >
              <div key={'bonding-curve-container'} className="w-full flex flex-col gap-6">
                <label htmlFor="token-name" className="block mb-1 text-xl font-medium text-gray-600">
                  Bonding Curve
                </label>

                {!selectedRepo?.liquidityPoolId && (
                  <div className="flex gap-12">
                    <div className="flex flex-col items-start gap-3 w-[40%]">
                      <div className="flex flex-col w-full">
                        <label htmlFor="curve-type" className="block mb-1 text-sm font-medium text-gray-600">
                          Curve Type
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="w-full">
                            <Listbox value={selectedCurveType} onChange={setSelectedCurveType}>
                              <div className="relative mt-1">
                                <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                  <span className="block truncate capitalize">{selectedCurveType.toLowerCase()}</span>
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
                                  <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
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
                                            <span
                                              className={`block capitalize truncate ${
                                                selected ? 'font-medium' : 'font-normal'
                                              }`}
                                            >
                                              {curveType.toLowerCase()}
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
                          <div className="w-full">
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
                        </div>
                      </div>
                      <div className="w-full">
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
                      <div className="w-full">
                        <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
                          Initial Buy Price
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            {...register('initialPrice')}
                            className={clsx(
                              'bg-white border-[1px] text-gray-9000 text-md rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                              tokenErrors.initialPrice ? 'border-red-500' : 'border-gray-300'
                            )}
                            placeholder="0.001"
                            disabled={!repoOwner || selectedRepo?.decentralized}
                          />
                        </div>
                        {tokenErrors.initialPrice && (
                          <p className="text-red-500 text-sm italic mt-2">{tokenErrors.initialPrice?.message}</p>
                        )}
                      </div>
                      {selectedCurveType !== 'FLAT' && (
                        <div className="w-full">
                          <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
                            Final Buy Price
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="text"
                              {...register('finalPrice')}
                              className={clsx(
                                'bg-white border-[1px] text-gray-900 text-md rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                                tokenErrors.finalPrice ? 'border-red-500' : 'border-gray-300'
                              )}
                              placeholder="0.001"
                              disabled={!repoOwner || selectedRepo?.decentralized}
                            />
                          </div>
                          {tokenErrors.finalPrice && (
                            <p className="text-red-500 text-sm italic mt-2">{tokenErrors.finalPrice?.message}</p>
                          )}
                        </div>
                      )}
                      <div className="w-72">
                        <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
                          Maximum Possible Funding
                        </label>
                        <h1 className="text-gray-600 text-2xl font-light">
                          {tvl} <span className="text-gray-600 text-lg">{selectedToken.tokenTicker}</span>
                        </h1>
                      </div>
                      <div className="w-72">
                        <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
                          Potential Market Cap
                        </label>
                        <h1 className="text-gray-600 text-2xl font-light">${potentialMarketCap}</h1>
                      </div>
                    </div>
                    <CurveChart curveSteps={[...curveSteps]} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-start flex-col gap-4 mt-8">
          <p className="text-gray-600 text-sm">
            <span className="text-red-500">*</span>20% of the maximum supply will be reserved to create liquidity pool
            on Botega.
          </p>
          <Button
            isLoading={isSubmitting}
            disabled={!repoOwner || selectedRepo?.decentralized || isSubmitting}
            onClick={handleSubmit(handleSubmitClick)}
            variant="primary-solid"
          >
            Save Token Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
