import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { FileImage } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'

import { fetchTokenDetails } from './fetchTokenDetails'

const DEFAULT_DENOMINATION = '18'
const DEFAULT_MAX_SUPPLY = '1000000000'

const schema = yup.object().shape({
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
  maxSupply: yup
    .string()
    .default(DEFAULT_MAX_SUPPLY)
    .required('Max supply is required')
    .matches(/^\d+$/, 'Must be a number'),
  tokenImage: yup.string().required('Image is required')
})

export default function GenericToken() {
  const [tokenProcessId, setTokenProcessId] = useState<string>('')
  const [tokenPRocessIdError, setTokenPRocessIdError] = useState<string | null>(null)
  const [tokenImageFile, setTokenImageFile] = useState<File | null>(null)
  const [tokenImageUrl, setTokenImageUrl] = useState<string | null>(null)
  const tokenImageRef = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    // control,
    formState: { errors: tokenErrors }
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
    // defaultValues: {
    //   tokenName: selectedRepo?.token?.tokenName || '',
    //   tokenTicker: selectedRepo?.token?.tokenTicker || '',
    //   denomination: selectedRepo?.token?.denomination || DEFAULT_DENOMINATION,
    //   totalSupply: selectedRepo?.token?.totalSupply || DEFAULT_TOTAL_SUPPLY,
    //   tokenImage: selectedRepo?.token?.tokenImage || '',
    //   initialPrice: selectedRepo?.bondingCurve?.initialPrice || DEFAULT_INITIAL_BUY_PRICE,
    //   finalPrice: selectedRepo?.bondingCurve?.finalPrice || DEFAULT_FINAL_BUY_PRICE,
    //   lpAllocation: selectedRepo?.bondingCurve?.lpAllocation || DEFAULT_LP_ALLOCATION,
    //   stepCount: selectedRepo?.bondingCurve?.stepCount || DEFAULT_STEP_COUNT,
    //   curveType: selectedRepo?.bondingCurve?.curveType || CURVE_TYPES[0],
    //   socialLink: selectedRepo?.token?.socialLink || ''
    // }
  })

  useEffect(() => {
    validateAndLoadTokenDetails(tokenProcessId)
  }, [tokenProcessId])

  async function handleTokenImageChange(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.target.files && evt.target.files[0]) {
      const url = URL.createObjectURL(evt.target.files[0])
      console.log(url)
      setTokenImageFile(evt.target.files[0])
      setTokenImageUrl(url)
    }
  }

  async function validateAndLoadTokenDetails(pid: string) {
    setTokenPRocessIdError(null)
    if (!pid) return

    // Validate process ID format
    if (!/^[a-zA-Z0-9_-]{43}$/.test(pid)) {
      setTokenPRocessIdError('Invalid process ID format')
      return
    }

    const tokenDetails = await fetchTokenDetails(pid)
    console.log(tokenDetails)
  }

  function handleTokenImageSelectClick() {
    tokenImageRef.current?.click()
  }

  function handleTokenImageResetClick() {
    setTokenImageFile(null)
    setTokenImageUrl(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full">
        <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
          Import from Token Process ID
        </label>
        <input
          type="text"
          id="token-process-id"
          placeholder="Enter Token Process ID"
          className={
            'bg-white border-[1px] text-gray-900 border-gray-300 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] w-1/2 px-3 py-[10px] outline-none'
          }
          value={tokenProcessId}
          onChange={(e) => setTokenProcessId(e.target.value)}
        />
        {tokenPRocessIdError && <p className="text-red-500 text-sm italic mt-2">{tokenPRocessIdError}</p>}
      </div>
      <div className="flex items-center w-full gap-4">
        <div className="h-[1px] bg-gray-200 flex-1"></div>
        <span className="text-sm text-gray-500 italic">OR</span>
        <div className="h-[1px] bg-gray-200 flex-1"></div>
      </div>
      <div className="flex flex-col gap-4">
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
                // defaultValue={selectedRepo?.name}
                // disabled={!repoOwner || selectedRepo?.decentralized}
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
                // disabled={!repoOwner || selectedRepo?.decentralized}
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
                disabled={true}
                // disabled={!repoOwner || selectedRepo?.decentralized}
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
                {...register('maxSupply')}
                className={clsx(
                  'bg-white border-[1px] text-gray-9000 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  tokenErrors.maxSupply ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="1000000000"
              />
              {tokenErrors.maxSupply && (
                <p className="text-red-500 text-sm italic mt-2">{tokenErrors.maxSupply?.message}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full gap-4">
          <div className="flex flex-col w-[50%]">
            <label htmlFor="token-name" className="block mb-4 text-sm font-medium text-gray-600">
              Token Image
            </label>
            <div className="flex">
              {!tokenImageUrl && (
                <div className="flex h-16 w-16 rounded-full border-primary-300 border-dashed border-[3px] items-center justify-center">
                  <FileImage className="text-primary-600 w-8 h-8" />
                </div>
              )}
              {tokenImageUrl && <img src={tokenImageUrl} className="rounded-full w-16 h-16" alt="token image" />}

              <input onChange={handleTokenImageChange} ref={tokenImageRef} type="file" hidden />
            </div>
            <div className="flex items-center mt-4 gap-4">
              <Button onClick={handleTokenImageSelectClick} variant="primary-solid" className="max-h-[34px] h-full">
                Select
              </Button>
              <Button onClick={handleTokenImageResetClick} variant="primary-outline" className="max-h-[34px] h-full">
                Clear
              </Button>
            </div>
          </div>

          {/* <div className="flex flex-col w-[100%]">
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
                // disabled={!repoOwner || selectedRepo?.decentralized}
              />
            </div>
            {tokenErrors.tokenImage && (
              <p className="text-red-500 text-sm italic mt-2">{tokenErrors.tokenImage?.message}</p>
            )}
          </div> */}
        </div>
        <div className="flex justify-start py-8">
          <Button variant="primary-solid" className="max-h-[34px] h-full">
            Create Token
          </Button>
        </div>
      </div>
    </div>
  )
}
