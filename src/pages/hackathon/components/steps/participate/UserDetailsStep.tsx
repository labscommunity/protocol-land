import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'

import ButtonWithLoadAndError from '@/components/common/buttons/CustomButton'
import { useGlobalStore } from '@/stores/globalStore'
import { User } from '@/types/user'

type Props = {
  handleStepChange: (num: number) => void
}

const schema = yup
  .object({
    fullname: yup.string().required('Full Name is required'),
    twitter: yup.string().required('Twitter is required'),
    email: yup.string().email().required('Email is required')
  })
  .required()

export default function UserDetailsStep({ handleStepChange }: Props) {
  const navigate = useNavigate()
  const [user, setUser] = React.useState<User | null>(null)
  const [submitStatus, setSubmitStatus] = React.useState<'neutral' | 'loading' | 'error' | 'success'>('neutral')
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      fullname: user?.fullname || '',
      email: user?.email || '',
      twitter: user?.twitter || ''
    }
  })
  const [address, selectedHackathon, saveUserDetails, fetchUserDetailsByAddress] = useGlobalStore((state) => [
    state.authState.address,
    state.hackathonState.selectedHackathon,
    state.userActions.saveUserDetails,
    state.userActions.fetchUserDetailsByAddress
  ])

  React.useEffect(() => {
    if (user) {
      setValue('fullname', user.fullname || '')
      setValue('email', user.email || '')
      setValue('twitter', user.twitter || '')
    }
  }, [user])

  React.useEffect(() => {
    if (!address && selectedHackathon) {
      navigate(`/hackathon/${selectedHackathon.id}`)
    }

    if (address) {
      getUserDetails(address)
    }
  }, [address, selectedHackathon])

  async function handleUserDetailsSubmit(data: yup.InferType<typeof schema>) {
    console.log({ data })

    try {
      setSubmitStatus('loading')
      await saveUserDetails(data, address!)

      setSubmitStatus('success')
    } catch (error) {
      setSubmitStatus('error')
    }

    setTimeout(() => {
      setSubmitStatus('neutral')
      handleStepChange(1)
    }, 500)
  }

  async function getUserDetails(addr: string) {
    const user = await fetchUserDetailsByAddress(addr)
    setUser(user)
  }

  return (
    <>
      <div className="p-2 my-6 flex flex-col w-full gap-6">
        <div className="flex flex-col flex-start gap-6">
          <div className="flex">
            <h1 className="text-xl font-medium">Participant details</h1>
          </div>
        </div>
        <div className="w-full">
          <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-600">
            Full Name
          </label>
          <div className="flex flex-col items-start gap-4">
            <input
              type="text"
              {...register('fullname')}
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                errors.fullname ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="Ex: John Doe"
            />
          </div>
          {errors.fullname && <p className="text-red-500 text-sm italic mt-2">{errors.fullname?.message}</p>}
        </div>
        <div className="w-full">
          <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-600">
            Twitter
          </label>
          <div className="flex flex-col items-start gap-4">
            <input
              type="text"
              {...register('twitter')}
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                errors.twitter ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="Ex: https://x.com/protocolland"
            />
          </div>
          {errors.twitter && <p className="text-red-500 text-sm italic mt-2">{errors.twitter?.message}</p>}
        </div>
        <div className="w-full">
          <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-600">
            Email
          </label>
          <div className="flex flex-col items-start gap-4">
            <input
              type="email"
              {...register('email')}
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                errors.email ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="Ex: johndoe@example.com"
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm italic mt-2">{errors.email?.message}</p>}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-8">
        <ButtonWithLoadAndError status={submitStatus} onClick={handleSubmit(handleUserDetailsSubmit)}>
          Save details
        </ButtonWithLoadAndError>
      </div>
    </>
  )
}
