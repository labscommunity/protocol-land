import { yupResolver } from '@hookform/resolvers/yup'
import clsx from 'clsx'
import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { AiOutlineTwitter, AiTwotoneMail } from 'react-icons/ai'
import { BsGlobe } from 'react-icons/bs'
import { TiLocation } from 'react-icons/ti'
import SVG from 'react-inlinesvg'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'

import ArNSIcon from '@/assets/icons/ar.io-logo-black.svg'
import { Button } from '@/components/common/buttons'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { shortenAddress } from '@/helpers/shortenAddress'
import { withAsync } from '@/helpers/withAsync'
import { uploadUserAvatar } from '@/lib/user'
import { useGlobalStore } from '@/stores/globalStore'
import { User } from '@/types/user'

import Avatar from './Avatar'
import UsernameModal from './UsernameModal'

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
            .max(39, 'Username must be at most 39 characters.')
            .matches(
              /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){3,38}$/,
              'Invalid username format. Use only letters, numbers, and hyphens. It must start with a letter or number and be at most 39 characters.'
            )
      }),
    isUserNameArNS: yup.boolean().required(),
    location: yup.string().trim(),
    // timezone: yup.object({
    //   value: yup.string(),
    //   label: yup.string(),
    //   offset: yup.string(),
    //   abbrev: yup.string(),
    //   altName: yup.string()
    // }),
    twitter: yup.string().trim(),
    // https://github.com/colinhacks/zod/blob/3e4f71e857e75da722bd7e735b6d657a70682df2/src/types.ts#L567
    email: yup
      .string()
      .matches(/^(?!\.)(?!.*\.\.)([A-Z0-9_+-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i, {
        excludeEmptyString: true,
        message: 'Email must be a valid email'
      })
      .trim(),
    website: yup.string().url('Website must be a valid URL').trim()
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
  const [isUsernameModalOpen, setIsUsernameModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { id } = useParams()
  const [avatar, setAvatar] = React.useState<null | File>(null)
  const [address, isLoggedIn, userArNSNames, saveUserDetails, fetchUserArNSListByAddress] = useGlobalStore((state) => [
    state.authState.address,
    state.authState.isLoggedIn,
    state.userState.userDetails.arNSNames,
    state.userActions.saveUserDetails,
    state.userActions.fetchUserArNSListByAddress
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(schema)
  })
  const formUserName = watch('username')
  const formIsUserNameArNS = watch('isUserNameArNS', userDetails.isUserNameArNS ? userDetails.isUserNameArNS : false)

  const [mode, setMode] = React.useState<'READ' | 'EDIT'>('READ')

  React.useEffect(() => {
    if (mode === 'EDIT') {
      if (!userDetails.isUserNameArNS) {
        setValue('isUserNameArNS', false)
      }

      for (const [key, value] of Object.entries(userDetails)) {
        setValue(key as any, value)
      }
    }
  }, [mode])

  React.useEffect(() => {
    if (isLoggedIn) {
      fetchUserArNSListByAddress(address!)
    }
  }, [isLoggedIn])

  async function handleSaveDetailsClick(data: yup.InferType<typeof schema>) {
    setIsSubmitting(true)

    const updatedData = getUpdatedFields(userDetails || {}, data)

    if (avatar) {
      const { response } = await withAsync(() => uploadUserAvatar(avatar))

      if (response) updatedData.avatar = response
    }

    if (Object.keys(updatedData).length > 0) {
      try {
        await saveUserDetails(updatedData, id!)
      } catch (err: any) {
        toast.error(err?.message || 'Error saving user details')
        setIsSubmitting(false)
        return
      }
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

      if (
        !isInvalidInput(updatedData[typedKey], ['string', 'boolean'], true) &&
        originalData[typedKey] !== updatedData[typedKey]
      ) {
        changes[typedKey] = updatedData[typedKey]
      }
    })

    return changes
  }

  function onUsernameChange(value: string, type?: string) {
    if (type === 'arns' && !formIsUserNameArNS) {
      setValue('isUserNameArNS', true, { shouldValidate: true, shouldTouch: true })
    }

    if (type === 'custom' && formIsUserNameArNS === true) {
      setValue('isUserNameArNS', false, { shouldValidate: true, shouldTouch: true })
    }

    setValue('username', value, { shouldValidate: true, shouldTouch: true })
  }

  function createArNSNameClickHandler(name: string) {
    return function () {
      window.open(`https://${name}.arweave.dev`, '_blank')
    }
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
              className={clsx(
                'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-2.5 py-1 outline-none border-gray-300'
              )}
              value={formUserName || ''}
              onClick={() => setIsUsernameModalOpen(true)}
              placeholder="johncancode"
            />
            {/* {errors.username && <p className="text-red-500 text-sm italic mt-2">{errors.username?.message}</p>} */}
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
          <div className="flex flex-col">
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
            {errors.email && <p className="text-red-500 text-sm italic mt-2 ml-5">{errors.email?.message}</p>}
          </div>
          <div className="flex flex-col">
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
            {errors.website && <p className="text-red-500 text-sm italic mt-2 ml-5">{errors.website?.message}</p>}
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
        <UsernameModal
          onUsernameChange={onUsernameChange}
          currentName={formUserName}
          isOpen={isUsernameModalOpen}
          setIsOpen={setIsUsernameModalOpen}
          isArNSName={formIsUserNameArNS}
          arNSNames={userArNSNames}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-[296px] gap-4">
      <Avatar setAvatar={setAvatar} mode={'READ'} url={userDetails?.avatar} />
      <div className="flex flex-col items-center">
        {userDetails.fullname && <h2 className="font-bold text-gray-900 text-2xl">{userDetails.fullname}</h2>}
        {userDetails.username && !userDetails.isUserNameArNS && (
          <h3 className="text-gray-600 text-base">{userDetails.username}</h3>
        )}
        {userDetails.username && userDetails.isUserNameArNS && (
          <div
            onClick={createArNSNameClickHandler(userDetails.username)}
            className="flex items-center cursor-pointer font-medium text-primary-600 text-lg tracking-wide"
          >
            <span className="mr-1">arns://</span>
            <span className="">{userDetails.username}</span>
            <span className="ml-2">
              <SVG className="w-5 h-5" src={ArNSIcon} />
            </span>
          </div>
        )}
        <h3 className="font-mono text-gray-600 text-sm mt-1">{shortenAddress(id!, 12)}</h3>
        {address === id! && isLoggedIn && (
          <div className="w-full mt-4">
            <Button onClick={handleEditDetailsClick} className="w-full justify-center" variant="primary-solid">
              Edit details
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 mt-2">
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
    </div>
  )
}
