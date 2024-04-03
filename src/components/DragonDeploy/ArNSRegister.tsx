import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import {
  formatIOBalance,
  getARBalance,
  getArNSNameFees,
  getIOBalance,
  registerArNSName,
  searchArNSName
} from '@/lib/dragondeploy/arns'
import { useGlobalStore } from '@/stores/globalStore'

const schema = yup
  .object({
    name: yup
      .string()
      .min(1, 'Name must have at least 1 character')
      .max(51, 'Name must have at most 51 characters')
      .matches(/^[a-zA-Z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed.')
      .test((value, ctx) => {
        if (value?.startsWith('-') || value?.endsWith('-')) {
          return ctx.createError({ message: 'Hyphens cannot be leading or trailing.' })
        }
        return true
      })
      .required('ArNS name is required'),
    isAvailable: yup.boolean().default(false),
    years: yup.number().integer().min(1).max(5).default(1).required('Years is required')
  })
  .required()

interface ArNSRegisterProps {
  closeModal: () => void
}

export default function ArNSRegister({ closeModal }: ArNSRegisterProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)
  const [balance, setBalance] = useState({ io: 0, ar: 0 })
  const [fees, setFees] = useState({ io: 0, ar: 0 })
  const [error, setError] = useState('')

  const [authState, selectedRepo, addDomain] = useGlobalStore((state) => [
    state.authState,
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.addDomain
  ])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  })

  async function loadBalances() {
    if (authState.address) {
      try {
        const [ioBalance, arBalance] = await Promise.all([
          getIOBalance(authState.address),
          getARBalance(authState.address, true)
        ])
        setBalance({ io: ioBalance, ar: arBalance })
      } catch (err) {
        setBalance({ io: 0, ar: 0 })
      }
    }
  }

  async function handleCreateBtnClick(data: yup.InferType<typeof schema>) {
    setIsRegistering(true)
    const { name, years } = data
    const transactionId = selectedRepo?.deployments[selectedRepo?.deployments.length - 1].txId as string
    const { response, error } = await withAsync(() => registerArNSName({ name, years, transactionId }))
    if (response?.success) {
      await addDomain({
        name,
        txId: transactionId,
        controller: authState.address!,
        contractTxId: response.ant.contractTxId
      })
      toast.success(response.message)
      closeModal()
    } else {
      setError(response?.message ?? (error as any)?.message)
    }
    setIsRegistering(false)
  }

  async function handleSearchBtnClick(data: yup.InferType<typeof schema>) {
    setIsSearching(true)
    const { name } = data

    const { response, error } = await withAsync(() => searchArNSName(name))

    if (response?.success) {
      setIsAvailable(true)
      setValue('isAvailable', true)
    } else {
      setError(response?.message ?? (error as any)?.message)
    }
    setIsSearching(false)
  }

  useEffect(() => {
    if (authState.isLoggedIn && isAvailable) {
      loadBalances()
    }
  }, [authState.isLoggedIn, isAvailable])

  useEffect(() => {
    const subscription = watch(({ name, years, isAvailable }) => {
      years = years ?? 1
      if (name && isAvailable && years && years >= 1 && years <= 5) {
        getArNSNameFees(name, years)
          .then(([ioFee, arFee]) => {
            setError('')
            setFees({ io: ioFee, ar: arFee })
          })
          .catch((error) => {
            if (error?.message) {
              setError(error.message)
            }
          })
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, isAvailable])

  return (
    <div className="flex justify-center items-center w-full">
      <div className="bg-white rounded-lg p-1 w-full">
        <p className="text-gray-600">Get a new ArNS domain for this repo deployment</p>
        {isAvailable && (
          <div className="flex justify-between items-center mt-4">
            <div>
              <h3 className="font-semibold">$IO Test</h3>
              <div className="mt-2">
                <div className="text-gray-600">Balance</div>
                <div>{formatIOBalance(balance.io)}</div>
              </div>
              <div className="mt-2">
                <div className="text-gray-600">Fee</div>
                <div>{formatIOBalance(fees.io)}</div>
              </div>
            </div>
            <div className="text-right">
              <h3 className="font-semibold">$AR</h3>
              <div className="mt-2">
                <div className="text-gray-600">Balance</div>
                <div>{balance.ar}</div>
              </div>
              <div className="mt-2">
                <div className="text-gray-600">Fee</div>
                <div>{fees.ar}</div>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col mt-4 gap-3">
          <div>
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
              Name
            </label>
            <input
              type="text"
              min={1}
              max={51}
              {...register('name')}
              disabled={isAvailable}
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                errors.name ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="ArNS Name"
            />
          </div>
          {isAvailable && (
            <div>
              <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
                Lease years
              </label>
              <input
                type="number"
                min={1}
                max={5}
                defaultValue={1}
                {...register('years')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  errors.name ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="ArNS Lease years"
              />
            </div>
          )}
          {errors.name && <span className="text-red-500 text-sm italic mt-2">* {errors.name?.message}</span>}
          {error && <span className="text-red-500 text-sm italic mt-2">* {error}</span>}
          {errors.years && <span className="text-red-500 text-sm italic mt-2">* {errors.years?.message}</span>}
        </div>
        <div className="flex flex-col gap-3 justify-center mt-6">
          {isAvailable ? (
            <div className="flex gap-2">
              <Button
                className="w-full flex justify-center"
                variant="primary-solid"
                isLoading={isRegistering}
                loadingText="Registering..."
                onClick={handleSubmit(handleCreateBtnClick)}
                disabled={
                  isRegistering ||
                  !!error ||
                  fees.ar === 0 ||
                  fees.io === 0 ||
                  balance.io < fees.io ||
                  balance.ar < fees.ar
                }
              >
                Register
              </Button>
              <Button
                className="w-full flex justify-center"
                variant="secondary"
                onClick={() => {
                  setValue('isAvailable', false)
                  setIsAvailable(false)
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                className="w-full flex justify-center"
                variant="primary-solid"
                isLoading={isSearching}
                disabled={isSearching}
                loadingText="Searching..."
                onClick={handleSubmit(handleSearchBtnClick)}
              >
                Search
              </Button>
              <Button className="w-full flex justify-center" variant="secondary" onClick={() => closeModal()}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
