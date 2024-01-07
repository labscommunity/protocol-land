import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineTwitter, AiTwotoneMail } from 'react-icons/ai'
import { BsGlobe } from 'react-icons/bs'
import { TiLocation } from 'react-icons/ti'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { shortenAddress } from '@/helpers/shortenAddress'
import { withAsync } from '@/helpers/withAsync'
import { uploadUserAvatar } from '@/lib/user'
import { useGlobalStore } from '@/stores/globalStore'
import { User } from '@/types/user'

import Avatar from './Avatar'

const schema = yup.object().shape(
  {
    fullname: yup
      .string()
      .trim()
      .notRequired()
      .when('fullname', {
        is: (value: string) => value?.length > 0,
        then: (rule) => rule.min(3, 'Full name must be more than 2 characters.')
      }),
    username: yup
      .string()
      .trim()
      .notRequired()
      .when('username', {
        is: (value: string) => value?.length > 0,
        then: (rule) =>
          rule
            .min(4, 'Username must be more than 3 characters.')
            .matches(
              /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/,
              'Invalid username format. Use only lowercase letters, numbers, and hyphens. It must start with a letter or number and be at most 39 characters.'
            )
      }),
    location: yup.string().trim(),
    // timezone: yup.object({
    //   value: yup.string(),
    //   label: yup.string(),
    //   offset: yup.string(),
    //   abbrev: yup.string(),
    //   altName: yup.string()
    // }),
    twitter: yup.string().trim(),
    email: yup.string().trim(),
    website: yup.string().trim()
  },
  [
    ['fullname', 'fullname'],
    ['username', 'username']
  ]
)

export default function Sidebar({
  userDetails,
  setUserDetails
}: {
  userDetails: Partial<User>
  setUserDetails: (details: Partial<User>) => void
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { id } = useParams()
  const [avatar, setAvatar] = React.useState<null | File>(null)
  const [address, isLoggedIn, saveUserDetails] = useGlobalStore((state) => [
    state.authState.address,
    state.authState.isLoggedIn,
    state.userActions.saveUserDetails
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    resolver: yupResolver(schema)
  })

  const [mode, setMode] = React.useState<'READ' | 'EDIT'>('READ')

  React.useEffect(() => {
    if (mode === 'EDIT') {
      for (const [key, value] of Object.entries(userDetails)) {
        setValue(key as any, value)
      }
    }
  }, [mode])

  async function handleSaveDetailsClick(data: yup.InferType<typeof schema>) {
    setIsSubmitting(true)

    const updatedData = getUpdatedFields(userDetails || {}, data)

    if (avatar) {
      const { response } = await withAsync(() => uploadUserAvatar(avatar))

      if (response) updatedData.avatar = response
    }

    if (Object.keys(updatedData).length > 0) {
      await saveUserDetails(updatedData, id!)
      setUserDetails({ ...userDetails, ...updatedData })
    }

    setMode('READ')
    setIsSubmitting(false)
  }

  async function handleEditDetailsClick() {
    setMode('EDIT')
  }

  function getUpdatedFields(originalData: Partial<User>, updatedData: any): Partial<User> {
    const changes: Partial<User> = {}

    Object.keys(updatedData).forEach((key: string) => {
      const typedKey = key as keyof User

      if (typeof updatedData[typedKey] !== 'undefined' && originalData[typedKey] !== updatedData[typedKey]) {
        changes[typedKey] = updatedData[typedKey]
      }
    })

    return changes
  }

  if (mode === 'EDIT') {
    return (
      <div className="flex flex-col w-[296px] gap-4">
        <Avatar setAvatar={setAvatar} mode={'EDIT'} url={userDetails?.avatar} />
        <div className="flex flex-col gap-2">
          <div>
            <label htmlFor="fullname" className="block mb-1 text-sm font-medium text-gray-600">
              Full name
            </label>
            <input
              type="text"
              {...register('fullname')}
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-2.5 py-1 outline-none',
                errors.fullname ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="John Doe"
            />
            {errors.fullname && <p className="text-red-500 text-sm italic mt-2">{errors.fullname?.message}</p>}
          </div>
          <div>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              {...register('username')}
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-2.5 py-1 outline-none',
                errors.username ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="johncancode"
            />
            {errors.username && <p className="text-red-500 text-sm italic mt-2">{errors.username?.message}</p>}
          </div>
          <h3 className="font-medium text-gray-600 text-md">{shortenAddress(id!, 9)}</h3>
        </div>
        <div className="flex flex-col gap-2  w-full">
          <div className="flex gap-2 items-center text-gray-900">
            <TiLocation className="w-5 h-5" />
            <div className="w-full">
              <input
                type="text"
                {...register('location')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-2.5 py-1 outline-none',
                  errors.location ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Askaban"
              />
            </div>
          </div>
          <div className="flex gap-2 items-center text-gray-900">
            <AiOutlineTwitter className="w-5 h-5" />
            <div className="w-full">
              <input
                type="text"
                {...register('twitter')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-2.5 py-1 outline-none',
                  errors.twitter ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="@johntheman"
              />
            </div>
          </div>
          <div className="flex gap-2 items-center text-gray-900">
            <AiTwotoneMail className="w-5 h-5" />
            <div className="w-full">
              <input
                type="text"
                {...register('email')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-2.5 py-1 outline-none',
                  errors.email ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="johndoe@domain.com"
              />
            </div>
          </div>
          <div className="flex gap-2 items-center text-gray-900">
            <BsGlobe className="w-5 h-5" />
            <div className="w-full">
              <input
                type="text"
                {...register('website')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-2.5 py-1 outline-none',
                  errors.website ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="https://mycoolsite.com"
              />
            </div>
          </div>
        </div>

        <div className="w-full mt-4 flex flex-col gap-2">
          <Button
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onClick={handleSubmit(handleSaveDetailsClick)}
            className="w-full justify-center font-medium"
            variant="primary-solid"
          >
            Save details
          </Button>
          <Button
            onClick={() => setMode('READ')}
            className="w-full font-medium justify-center"
            variant="primary-outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-[296px] gap-4">
      <Avatar setAvatar={setAvatar} mode={'READ'} url={userDetails?.avatar} />
      <div className="flex flex-col">
        {userDetails.fullname && <h2 className="font-bold text-gray-900 text-2xl">{userDetails.fullname}</h2>}
        {userDetails.username && <h3 className="font-medium text-gray-600 text-lg">{userDetails.username}</h3>}
        <h3 className="font-medium text-gray-600 text-lg">{shortenAddress(id!, 12)}</h3>
      </div>
      <div className="flex flex-col gap-1">
        {userDetails.location && (
          <div className="flex gap-2 items-center text-gray-600 text-lg">
            <TiLocation className="w-5 h-5" />
            <h4>{userDetails.location}</h4>
          </div>
        )}
        {userDetails.twitter && (
          <div className="flex gap-2 items-center text-gray-600 text-lg">
            <AiOutlineTwitter className="w-5 h-5" />
            <h4>{userDetails.twitter}</h4>
          </div>
        )}
        {userDetails.email && (
          <div className="flex gap-2 items-center text-gray-600 text-lg">
            <AiTwotoneMail className="w-5 h-5" />
            <h4>{userDetails.email}</h4>
          </div>
        )}
        {userDetails.website && (
          <div className="flex gap-2 items-center text-gray-600 text-lg">
            <BsGlobe className="w-5 h-5" />
            <h4>{userDetails.website}</h4>
          </div>
        )}
      </div>
      {address === id! && isLoggedIn && (
        <div className="w-full mt-4">
          <Button onClick={handleEditDetailsClick} className="w-full justify-center" variant="primary-solid">
            Edit details
          </Button>
        </div>
      )}
    </div>
  )
}
