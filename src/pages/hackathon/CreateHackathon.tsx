import { yupResolver } from '@hookform/resolvers/yup'
import MDEditor from '@uiw/react-md-editor'
import clsx from 'clsx'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { AiFillCamera } from 'react-icons/ai'
import { FaArrowLeft, FaPlus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'
import { Prize } from '@/types/hackathon'

import { prepareHackathonItemToPost } from './utils/prepareHackathonItemToPost'

const schema = yup
  .object({
    title: yup.string().required('Title is required'),
    shortDescription: yup.string().required('Description is required'),
    details: yup.string().required('Details is required'),
    startsAt: yup
      .date()
      .min(new Date(), 'Start date must be in the future')
      .typeError('Invalid start date')
      .required('Start date is required'),
    endsAt: yup
      .date()
      .typeError('Invalid end date')
      .required('Start date is required')
      .test('same_dates_test', 'Start and end dates must not be equal.', function (value: Date | undefined) {
        const { startsAt } = this.parent

        if (!value) return false
        return value?.getTime() !== startsAt.getTime()
      })
      .test('past_dates_test', 'End date must be greater than start date.', function (value: Date | undefined) {
        const { startsAt } = this.parent

        if (!value) return false
        return value?.getTime() > startsAt.getTime()
      }),
    totalRewards: yup
      .number()
      .positive('Total rewards must be greater than 0')
      .typeError('Invalid Total rewards')
      .required('Total rewards is required'),
    totalRewardsBase: yup.string().required('Reward base is required'),
    location: yup.string().required('Location base is required'),
    prizes: yup
      .array()
      .of(
        yup.object({
          id: yup.string().required('ID is required'),
          name: yup.string().required('Name is required'),
          description: yup.string().required('Description is required'),
          amount: yup
            .number()
            .positive('Amount must be greater than 0')
            .typeError('Invalid amount')
            .required('Amount is required'),
          base: yup.string().required('Base is required'),
          winningParticipantsCount: yup
            .number()
            .positive('Number of winning participants must be greater than 0')
            .typeError('Invalid input')
            .required('Number of winning participants is required')
        })
      )
      .required('Prizes are required'),
    hostedBy: yup.string().required('Host name is required'),
    tags: yup.string()
  })
  .required()

export default function CreateHackathon() {
  const hackathonLogoInputRef = React.useRef<HTMLInputElement>(null)
  const hostLogoInputRef = React.useRef<HTMLInputElement>(null)

  const [hackathonLogoUrl, setHackathonLogoUrl] = React.useState<string | null>(null)
  const [hostLogoUrl, setHostLogoUrl] = React.useState<string | null>(null)
  const [hackathonLogoFile, setHackathonLogoFile] = React.useState<null | File>(null)
  const [hostLogoFile, setHostLogoFile] = React.useState<File | null>(null)

  const [rewardBase, setRewardBase] = React.useState<string>('USD')
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    control
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      totalRewardsBase: 'USD',
      prizes: []
    }
  })
  const { fields, append } = useFieldArray({ name: 'prizes', control })
  const [createNewHackathon] = useGlobalStore((state) => [
    state.hackathonActions.createNewHackathon,
    state.hackathonState.status
  ])
  const watchPrizeBases = watch('prizes', []) || []
  const watchDetails = watch('details', '# Hello') || ''

  React.useEffect(() => {
    setValue('totalRewardsBase', rewardBase)
  }, [rewardBase])
  React.useEffect(() => {
    if (fields.length === 0) {
      appendEmptyPrize()
    }
  }, [])

  const navigate = useNavigate()

  function goBack() {
    navigate(`/hackathon`)
  }

  async function handleHackathonLogoChange(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.target.files && evt.target.files[0]) {
      const url = URL.createObjectURL(evt.target.files[0])

      setHackathonLogoFile(evt.target.files[0])
      setHackathonLogoUrl(url)
    }
  }

  function handleHackathonLogoSelectClick() {
    hackathonLogoInputRef.current?.click()
  }

  function handleHackathonLogoResetClick() {
    setHackathonLogoFile(null)
    setHackathonLogoUrl(null)
  }

  function handleHackathonLogoUrlChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setHackathonLogoUrl(evt.target.value)
  }

  async function handleHostLogoChange(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.target.files && evt.target.files[0]) {
      const url = URL.createObjectURL(evt.target.files[0])

      setHostLogoFile(evt.target.files[0])
      setHostLogoUrl(url)
    }
  }

  function handleHostLogoSelectClick() {
    hostLogoInputRef.current?.click()
  }

  function handleHostLogoResetClick() {
    setHostLogoFile(null)
    setHostLogoUrl(null)
  }

  function handleHostLogoUrlChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setHostLogoUrl(evt.target.value)
  }

  function handleBaseChange(newBase: string) {
    setRewardBase(newBase)
  }

  function appendEmptyPrize() {
    append({ id: uuid(), name: '', description: '', amount: 0, base: 'USD', winningParticipantsCount: 1 })
  }

  async function handleHackathonSubmit(data: yup.InferType<typeof schema>) {
    const tags = data.tags ? data.tags.split(',') : []
    const startsAt = 1720044000
    const endsAt = Math.floor(data.endsAt.getTime() / 1000)
    const prizes: Record<string, Prize> = data.prizes.reduce(
      (acc, curr) => {
        acc[curr.id] = curr

        return acc
      },
      {} as Record<string, Prize>
    )

    if (!hostLogoFile || !hackathonLogoFile) {
      toast.error('Host Logo and HackathonLogo are mandatory.')
      return
    }

    const dataCopy = {
      ...data,
      startsAt,
      endsAt,
      tags,
      hostLogoFile,
      hackathonLogoFile,
      prizes
    }

    const preparedHackItem = await prepareHackathonItemToPost({ ...dataCopy })
    await createNewHackathon(preparedHackItem)

    navigate(`/hackathon/${preparedHackItem.id}`)
  }

  return (
    <div className="h-full flex-1 flex flex-col max-w-[960px] px-8 mx-auto w-full my-6 gap-2">
      <div className="flex relative">
        <Button onClick={goBack} variant="primary-solid" className="cursor-pointer z-40">
          <FaArrowLeft className="h-4 w-4 text-white" />
        </Button>
        <div className="absolute w-full flex items-center justify-center h-full z-10">
          <h1 className="text-2xl font-medium text-gray-900">Create a new Hackathon</h1>
        </div>
      </div>
      <div className="flex flex-col w-full py-12 gap-12">
        {/* HACKATHON DETAILS */}
        <div className="flex flex-col flex-start gap-6">
          {/* IMAGE(hackathon logo) */}
          <div className="flex">
            <h1 className="text-xl font-medium">Hackathon details</h1>
          </div>
          <div className="flex w-full gap-12">
            <div className="w-32 h-32 bg-slate-500 rounded-full flex items-center justify-center">
              {hackathonLogoUrl && <img src={hackathonLogoUrl} className="rounded-full w-32 h-32" />}
              {!hackathonLogoUrl && <AiFillCamera className="w-8 h-8 text-white" />}
              <input onChange={handleHackathonLogoChange} ref={hackathonLogoInputRef} type="file" hidden />
            </div>
            <div className="flex items-center gap-8 flex-1">
              {!hackathonLogoFile && (
                <Button
                  onClick={handleHackathonLogoSelectClick}
                  className="w-2/4 justify-center"
                  variant="primary-outline"
                >
                  Select Logo
                </Button>
              )}
              {hackathonLogoFile && (
                <Button
                  onClick={handleHackathonLogoResetClick}
                  className="w-2/4 justify-center"
                  variant="primary-outline"
                >
                  Reset Selection
                </Button>
              )}
              <span className="text-gray-600 font-medium">OR</span>
              <div className="w-full">
                <div className="flex flex-col items-start gap-4">
                  <input
                    onChange={handleHackathonLogoUrlChange}
                    disabled={hackathonLogoFile !== null}
                    type="text"
                    className={clsx(
                      'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                      'border-gray-300'
                    )}
                    placeholder="Paste Logo URL"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* TITLE */}
          <div className="w-full">
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
              Title
            </label>
            <div className="flex flex-col items-start gap-4">
              <input
                type="text"
                {...register('title')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  errors.title ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Ex: Build on AO Hackathon"
              />
            </div>
            {errors.title && <p className="text-red-500 text-sm italic mt-2">{errors.title?.message}</p>}
          </div>
          {/* DESCRIPTION */}
          <div className="w-full">
            <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-600">
              Short Description
            </label>
            <div className="flex flex-col items-start gap-4">
              <input
                type="text"
                {...register('shortDescription')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  errors.shortDescription ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Ex: A New hackathon to build on AO and best project takes away the price."
              />
            </div>
            {errors.shortDescription && (
              <p className="text-red-500 text-sm italic mt-2">{errors.shortDescription?.message}</p>
            )}
          </div>
          {/* START-END RANGE */}
          <div className="w-full flex gap-6">
            <div className="w-full">
              <label htmlFor="expiry" className="block mb-1 text-sm font-medium text-gray-600">
                Start Date
              </label>
              <div className="flex items-center">
                <input
                  {...register('startsAt')}
                  className={clsx(
                    'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                    errors.startsAt ? 'border-red-500' : 'border-gray-300'
                  )}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  placeholder="2"
                />
              </div>
              {errors.startsAt && <p className="text-red-500 text-sm italic mt-2">{errors.startsAt.message}</p>}
            </div>
            <div className="w-full">
              <label htmlFor="expiry" className="block mb-1 text-sm font-medium text-gray-600">
                End Date
              </label>
              <div className="flex items-center w-full">
                <input
                  {...register('endsAt')}
                  className={clsx(
                    'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                    errors.endsAt ? 'border-red-500' : 'border-gray-300'
                  )}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  placeholder="2"
                />
              </div>
              {errors.endsAt && <p className="text-red-500 text-sm italic mt-2">{errors.endsAt.message}</p>}
            </div>
          </div>
          {/* LOCATION */}
          {/* TOTAL REWARD in USD/AR */}
          <div className="w-full flex gap-6">
            <div className="w-full">
              <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-600">
                Total Rewards
              </label>
              <div className="relative flex items-center">
                <input
                  {...register('totalRewards')}
                  className={clsx(
                    'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                    errors.totalRewards ? 'border-red-500' : 'border-gray-300'
                  )}
                  step="0.5"
                  type="number"
                  placeholder="2"
                  min={'0'}
                />
                <div className="h-full absolute right-4 top-0 flex items-center gap-2">
                  <span
                    className={clsx({
                      'font-medium text-gray-600 cursor-pointer': rewardBase !== 'AR',
                      'font-medium text-primary-600 underline cursor-pointer': rewardBase === 'AR'
                    })}
                    onClick={() => handleBaseChange('AR')}
                  >
                    AR
                  </span>
                  <span
                    className={clsx({
                      'font-medium text-gray-600 cursor-pointer': rewardBase !== 'USD',
                      'font-medium text-primary-600 underline cursor-pointer': rewardBase === 'USD'
                    })}
                    onClick={() => handleBaseChange('USD')}
                  >
                    USD
                  </span>
                </div>
              </div>
              {errors.totalRewards && <p className="text-red-500 text-sm italic mt-2">{errors.totalRewards.message}</p>}
            </div>
            <div className="w-full">
              <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
                Location
              </label>
              <div className="flex flex-col items-start gap-4">
                <input
                  type="text"
                  {...register('location')}
                  className={clsx(
                    'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  )}
                  placeholder="Ex: Online"
                />
              </div>
              {errors.location && <p className="text-red-500 text-sm italic mt-2">{errors.location?.message}</p>}
            </div>
          </div>
          <div className="w-full flex flex-col">
            <span className="block mb-1 text-sm font-medium text-gray-600">Details</span>
            <div className="mt-2">
              <MDEditor
                className={clsx({
                  'border-red-500 border-[1px]': errors.details
                })}
                height={700}
                preview="edit"
                value={watchDetails}
                onChange={(val) => {
                  setValue('details', val!)
                  trigger('details')
                }}
              />
              {errors.details && <p className="text-red-500 text-sm italic mt-2">{errors.details.message}</p>}
            </div>
          </div>
          {/* PRICES */}
          <div className="w-full flex flex-col gap-4">
            <span className="block mb-1 text-sm font-medium text-gray-600">Prizes</span>

            <div className="w-full grid grid-cols-2 gap-6">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex flex-col p-6 bg-white rounded-lg gap-4 border-[1px] border-gray-300"
                >
                  <div>
                    <label htmlFor="prize-name" className="block mb-1 text-sm font-medium text-gray-600">
                      Prize Name
                    </label>
                    <div className="relative flex items-center">
                      <input
                        {...register(`prizes.${idx}.name`)}
                        className={clsx(
                          'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                          'border-gray-300'
                        )}
                        type="text"
                        placeholder="Ex: First Prize"
                      />
                    </div>
                    
                    {errors.prizes && errors.prizes[idx] && errors.prizes![idx]?.name && (
                      <p className="text-red-500 text-sm italic mt-2">{errors?.prizes![idx]?.name?.message}</p>
                    )}
                  </div>
                  <div className="w-full">
                    <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-600">
                      Amount
                    </label>
                    <div className="relative flex items-center">
                      <input
                        {...register(`prizes.${idx}.amount`)}
                        className={clsx(
                          'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                          errors.prizes && errors.prizes[idx]?.amount ? 'border-red-500' : 'border-gray-300'
                        )}
                        step="0.5"
                        type="number"
                        placeholder="2"
                        min={'0'}
                      />
                      <div className="h-full absolute right-4 top-0 flex items-center gap-2">
                        <span
                          className={clsx({
                            'font-medium text-gray-600 cursor-pointer': watchPrizeBases[idx].base !== 'AR',
                            'font-medium text-primary-600 underline cursor-pointer': watchPrizeBases[idx].base === 'AR'
                          })}
                          onClick={() => setValue(`prizes.${idx}.base`, 'AR')}
                        >
                          AR
                        </span>
                        <span
                          className={clsx({
                            'font-medium text-gray-600 cursor-pointer': watchPrizeBases[idx].base !== 'USD',
                            'font-medium text-primary-600 underline cursor-pointer': watchPrizeBases[idx].base === 'USD'
                          })}
                          onClick={() => setValue(`prizes.${idx}.base`, 'USD')}
                        >
                          USD
                        </span>
                      </div>
                    </div>
                    {errors.prizes && errors.prizes![idx]?.amount && (
                      <p className="text-red-500 text-sm italic mt-2">{errors.prizes![idx]?.amount?.message}</p>
                    )}
                  </div>
                  <div className="w-full">
                    <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-600">
                      Number of winning participants
                    </label>
                    <div className="relative flex items-center">
                      <input
                        {...register(`prizes.${idx}.winningParticipantsCount`)}
                        className={clsx(
                          'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                          errors.prizes && errors.prizes[idx]?.winningParticipantsCount
                            ? 'border-red-500'
                            : 'border-gray-300'
                        )}
                        type="number"
                        defaultValue={1}
                        placeholder="Ex: 1"
                      />
                    </div>
                    {errors.prizes && errors.prizes[idx]?.winningParticipantsCount && (
                      <p className="text-red-500 text-sm italic mt-2">
                        {errors.prizes[idx]?.winningParticipantsCount?.message}
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-600">
                      Description
                    </label>
                    <div className="relative flex items-center">
                      <textarea
                        rows={4}
                        {...register(`prizes.${idx}.description`)}
                        className={clsx(
                          'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                          errors.prizes && errors.prizes[idx]?.description ? 'border-red-500' : 'border-gray-300'
                        )}
                      />
                    </div>
                    {errors.prizes && errors.prizes[idx] && errors.prizes[idx]?.description && (
                      <p className="text-red-500 text-sm italic mt-2">{errors.prizes[idx]?.description?.message}</p>
                    )}
                  </div>
                </div>
              ))}

              <div
                onClick={appendEmptyPrize}
                className="cursor-pointer min-h-[478px] flex items-center justify-center flex-col p-6 bg-white bg-opacity-50 hover:border-primary-600 rounded-lg gap-4 border-[1px] border-gray-300"
              >
                <FaPlus className="w-10 h-10 text-primary-800" />
                <h1 className="text-primary-800 text-lg font-medium">Add new prize</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-start gap-6">
          <div className="flex">
            <h1 className="text-xl font-medium">Host details</h1>
          </div>
          <div className="flex w-full gap-12">
            <div className="w-32 h-32 bg-slate-500 rounded-full flex items-center justify-center">
              {hostLogoUrl && <img src={hostLogoUrl} className="rounded-full w-32 h-32" />}
              {!hostLogoUrl && <AiFillCamera className="w-8 h-8 text-white" />}
              <input onChange={handleHostLogoChange} ref={hostLogoInputRef} type="file" hidden />
            </div>
            <div className="flex items-center gap-8 flex-1">
              {!hostLogoFile && (
                <Button onClick={handleHostLogoSelectClick} className="w-2/4 justify-center" variant="primary-outline">
                  Select Logo
                </Button>
              )}
              {hostLogoFile && (
                <Button onClick={handleHostLogoResetClick} className="w-2/4 justify-center" variant="primary-outline">
                  Reset Selection
                </Button>
              )}
              <span className="text-gray-600 font-medium">OR</span>
              <div className="w-full">
                <div className="flex flex-col items-start gap-4">
                  <input
                    onChange={handleHostLogoUrlChange}
                    disabled={hostLogoFile !== null}
                    type="text"
                    className={clsx(
                      'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                      'border-gray-300'
                    )}
                    placeholder="Paste Logo URL"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex gap-6 mt-2">
            <div className="w-full">
              <label htmlFor="host" className="block mb-1 text-sm font-medium text-gray-600">
                Host Name
              </label>
              <div className="relative flex items-center">
                <input
                  {...register('hostedBy')}
                  className={clsx(
                    'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                    errors.hostedBy ? 'border-red-500' : 'border-gray-300'
                  )}
                  type="text"
                  placeholder="Ex: Beavers inc"
                />
              </div>
              {errors.hostedBy && <p className="text-red-500 text-sm italic mt-2">{errors.hostedBy.message}</p>}
            </div>
            <div className="w-full">
              <label htmlFor="tags" className="block mb-1 text-sm font-medium text-gray-600">
                Tags
              </label>
              <div className="flex flex-col items-start gap-4">
                <input
                  type="text"
                  {...register('tags')}
                  className={clsx(
                    'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                    errors.tags ? 'border-red-500' : 'border-gray-300'
                  )}
                  placeholder="Ex: Arweave, Warp, React"
                />
              </div>
              {errors.tags && <p className="text-red-500 text-sm italic mt-2">{errors.tags?.message}</p>}
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <Button
            // isLoading={status === 'PENDING'}
            // disabled={status === 'PENDING'}
            onClick={handleSubmit(handleHackathonSubmit)}
            variant="primary-solid"
            className="w-44 justify-center"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}
