import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import { getANT, getARBalance, getArFee, searchArNSName, updateArNSDomain } from '@/lib/dragondeploy/arns'
import { useGlobalStore } from '@/stores/globalStore'

const schema = yup
  .object({
    name: yup
      .string()
      .min(1, 'Name must have at least 1 character')
      .max(94, 'Name must have at most 51 characters')
      .matches(/^[a-zA-Z0-9_-]+$/, 'Only alphanumeric characters and hyphens are allowed.')
      .test((value, ctx) => {
        if (value?.startsWith('-') || value?.endsWith('-') || value?.startsWith('_') || value?.endsWith('_')) {
          return ctx.createError({ message: 'Hyphens or underscores cannot be leading or trailing.' })
        }
        return true
      })
      .required('ArNS name is required'),
    isAvailable: yup.boolean().default(false),
    years: yup.number().min(0).max(5).default(1).required('Years is required')
  })
  .required()

interface ArNSAddProps {
  closeModal: () => void
}

export default function ArNSAdd({ closeModal }: ArNSAddProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)
  const [balance, setBalance] = useState(0)
  const [fee, setFee] = useState(0)
  const [error, setError] = useState('')
  const [domain, setDomain] = useState({ contractTxId: '', undername: '', name: '' })

  const [authState, selectedRepo, addDomain] = useGlobalStore((state) => [
    state.authState,
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.addDomain
  ])

  const deploymentCounts = selectedRepo?.deployments?.length ?? 0
  const deployment = selectedRepo?.deployments?.[deploymentCounts - 1]

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
        const arBalance = await getARBalance(authState.address, true)
        setBalance(arBalance)
      } catch (err) {
        setBalance(0)
      }
    }
  }

  async function handleAddBtnClick(data: yup.InferType<typeof schema>) {
    if (!domain || !deployment) return

    try {
      setIsAdding(true)
      const ant = await getANT(domain.contractTxId)

      const hasPermission =
        (ant?.controllers && ant?.controllers?.includes(authState.address)) || ant.owner === authState.address

      if (!hasPermission) {
        throw new Error('You are not allowed to update this domain')
      }

      const updateArNSDomainResult = await withAsync(() =>
        updateArNSDomain({
          antContract: domain.contractTxId,
          transactionId: deployment.txId,
          subDomain: domain.undername || '@'
        })
      )

      if (updateArNSDomainResult.error || !updateArNSDomainResult.response?.success) {
        throw updateArNSDomainResult.error
      }

      const addDomainResult = await withAsync(() =>
        addDomain({
          name: data.name,
          txId: deployment.txId,
          controller: authState.address!,
          contractTxId: domain.contractTxId
        })
      )

      if (addDomainResult.error) {
        throw addDomainResult.error
      }

      toast.success('Added domain to the latest deployment')
    } catch (error) {
      toast.error((error as any)?.message)
    } finally {
      setIsAdding(false)
    }
  }

  async function handleSearchBtnClick(data: yup.InferType<typeof schema>) {
    setIsSearching(true)

    let undername = ''
    let name = data.name

    const nameSplits = data.name.split('_')

    if (nameSplits.length === 2) {
      undername = nameSplits[0]
      name = nameSplits[1]
    }

    const { response } = await withAsync(() => searchArNSName(name))

    if (!response?.success) {
      const { response: ant } = await withAsync(() => getANT(response?.record?.record?.contractTxId))
      if (ant?.subdomain !== 'not_defined') {
        const { owner, controllers, records } = ant
        const hasPermission = (controllers && controllers.includes(authState.address)) || owner === authState.address
        if ((hasPermission && !undername) || (hasPermission && undername in records)) {
          setDomain({ contractTxId: ant.id, undername, name })
          setIsAvailable(true)
          setValue('isAvailable', true)
        } else {
          setError('You are not an owner or a controller for this ArNS name.')
        }
      } else {
        setError('Failed to get information about this ArNS name')
      }
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
    const subscription = watch(({ name, isAvailable }) => {
      if (!errors.name?.message && !errors.years?.message && isAvailable) {
        getArFee(name)
          .then((arFee) => {
            setError('')
            setFee(arFee)
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
        <p className="text-gray-600">Add an ArNS domain for this repo deployment</p>
        {isAvailable && (
          <div className="flex justify-between items-center mt-4">
            <h3 className="font-semibold">$AR</h3>
            <div className="mt-2">
              <div className="text-gray-600">Balance</div>
              <div>{balance}</div>
            </div>
            <div className="mt-2">
              <div className="text-gray-600">Fee</div>
              <div>{fee}</div>
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
                isLoading={isAdding}
                loadingText="Adding..."
                onClick={handleSubmit(handleAddBtnClick)}
                disabled={isAdding || !!error || fee === 0 || balance < fee}
              >
                Add
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
