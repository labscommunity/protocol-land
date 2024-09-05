import { yupResolver } from '@hookform/resolvers/yup'
import MDEditor from '@uiw/react-md-editor'
import clsx from 'clsx'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { AiFillCamera } from 'react-icons/ai'
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { FadeLoader } from 'react-spinners'

import { Button } from '@/components/common/buttons'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { useGlobalStore } from '@/stores/globalStore'
import { Submission } from '@/types/hackathon'

import { HackathonSubmissionSchema, hackathonSubmissionSchema } from './config/schema'
import { prepareHackathonSubmissionToSave } from './utils/prepareHackathonSubmissionToSave'
import { prepareSubmissionToLoad } from './utils/prepareSubmissionToLoad'

export default function SubmitHackathon() {
  const [status, setStatus] = React.useState<ApiStatus>('IDLE')
  const [draftStatus, setDraftStatus] = React.useState<ApiStatus>('IDLE')
  const projectLogoInputRef = React.useRef<HTMLInputElement>(null)
  const { id } = useParams()
  const [projectLogoUrl, setProjectLogoUrl] = React.useState<string | null>(null)
  const [projectLogoFile, setProjectLogoFile] = React.useState<null | File>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    control
  } = useForm({
    resolver: yupResolver(hackathonSubmissionSchema),
    mode: 'onTouched'
  })
  const {
    fields: imagesFields,
    append: appendImages,
    remove: removeImages
  } = useFieldArray({ name: 'images', control })
  const { fields: linksFields, append: appendLinks, remove: removeLinks } = useFieldArray({ name: 'links', control })
  const [fetchHackathonById, saveSubmission, selectedSubmission, selectedHackathon, fetchSubmissionStatus] =
    useGlobalStore((state) => [
      state.hackathonActions.fetchHackathonById,
      state.hackathonActions.saveSubmission,
      state.hackathonState.selectedSubmission,
      state.hackathonState.selectedHackathon,
      state.hackathonState.status
    ])

  const watchDetails = watch('details', '# My Project details') || ''

  React.useEffect(() => {
    if (id) {
      fetchHackathonById(id)
    }
  }, [id])

  React.useEffect(() => {
    if (fetchSubmissionStatus === 'PENDING') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
      if (selectedSubmission) {
        handlePrepareSubmissionToLoad(selectedSubmission)
      }
    }
  }, [fetchSubmissionStatus])

  const navigate = useNavigate()

  function goBack() {
    navigate(-1)
  }

  async function handlePrepareSubmissionToLoad(submission: Partial<Submission>) {
    const preparedSubmission = await prepareSubmissionToLoad(submission)

    for (const key in preparedSubmission) {
      const typedKey = key as keyof typeof preparedSubmission

      if (!preparedSubmission[typedKey]) continue

      setValue(typedKey, preparedSubmission[typedKey])
    }
    // setSubmissionToLoad(preparedSubmission)
  }

  async function handleProjectLogoChange(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.target.files && evt.target.files[0]) {
      const url = URL.createObjectURL(evt.target.files[0])

      setProjectLogoFile(evt.target.files[0])
      setProjectLogoUrl(url)
    }
  }

  function handleProjectLogoSelectClick() {
    projectLogoInputRef.current?.click()
  }

  function handleProjectLogoResetClick() {
    setProjectLogoFile(null)
    setProjectLogoUrl(null)
  }

  function handleProjectLogoUrlChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setProjectLogoUrl(evt.target.value)
  }

  async function handleProjectSave(data: HackathonSubmissionSchema) {
    setDraftStatus('PENDING')

    if (data.details && selectedSubmission && selectedSubmission.descriptionTxId) {
      try {
        const description = await fetch(`https://arweave.net/${selectedSubmission.descriptionTxId}`)
        const originalDetails = await description.text()

        if (originalDetails === data.details) {
          delete data.details
        }
      } catch (error) {
        console.log(error)
      }
    }

    const preparedSubmissionToSave = await prepareHackathonSubmissionToSave({
      ...data,
      projectLogoFile: projectLogoFile || undefined
    })

    const updatedFields = getUpdatedFields(selectedSubmission || {}, preparedSubmissionToSave)
    if (Object.keys(updatedFields).length === 0) {
      toast.success('No changes to update.')
      setDraftStatus('SUCCESS')

      return
    }
    await saveSubmission(id!, updatedFields)
    setDraftStatus('SUCCESS')
  }

  async function handleProjectSubmit(data: HackathonSubmissionSchema) {
    setStatus('PENDING')

    if (data.details && selectedSubmission && selectedSubmission.descriptionTxId) {
      try {
        const description = await fetch(`https://arweave.net/${selectedSubmission.descriptionTxId}`)
        const originalDetails = await description.text()

        if (originalDetails === data.details) {
          delete data.details
        }
      } catch (error) {
        console.log(error)
      }
    }

    const preparedSubmissionToSave = await prepareHackathonSubmissionToSave({
      ...data,
      projectLogoFile: projectLogoFile || undefined
    })

    const updatedFields = getUpdatedFields(selectedSubmission || {}, preparedSubmissionToSave)

    await saveSubmission(id!, updatedFields, true)
    setStatus('SUCCESS')
  }

  function appendEmptyImage() {
    appendImages({ url: '' })
  }

  function appendEmptyLink() {
    appendLinks({ url: '' })
  }

  function getUpdatedFields(originalData: Partial<Submission>, updatedData: any): Partial<Submission> {
    const changes: Partial<Submission> = {}

    Object.keys(updatedData).forEach((key: string) => {
      const typedKey = key as keyof Submission

      if (!isInvalidInput(updatedData[typedKey], ['string', 'array'])) {
        if (
          Array.isArray(updatedData[typedKey]) &&
          JSON.stringify(updatedData[typedKey]) !== JSON.stringify(originalData[typedKey])
        ) {
          changes[typedKey] = updatedData[typedKey] as any
        } else if (!Array.isArray(updatedData[typedKey]) && originalData[typedKey] !== updatedData[typedKey]) {
          changes[typedKey] = updatedData[typedKey]
        }
      }
    })

    return changes
  }

  const isReady = selectedHackathon && fetchSubmissionStatus === 'SUCCESS'

  return (
    <div className="h-full flex-1 flex flex-col max-w-[960px] px-8 mx-auto w-full my-6 gap-2">
      {!isReady && (
        <div className="fixed w-screen h-screen top-0 left-0 bg-black/50 z-50 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <FadeLoader color="#56ADD9" />
          </div>
        </div>
      )}
      <div className="flex relative">
        <Button onClick={goBack} variant="primary-solid" className="cursor-pointer z-40">
          <FaArrowLeft className="h-4 w-4 text-white" />
        </Button>
        <div className="absolute w-full flex items-center justify-center h-full z-10">
          <h1 className="text-2xl font-medium text-gray-900">Project Submission</h1>
        </div>
      </div>
      <div className="flex flex-col w-full py-12 gap-12">
        {/* HACKATHON DETAILS */}
        <div className="flex flex-col flex-start gap-6">
          {/* IMAGE(hackathon logo) */}
          <div className="flex">
            <h1 className="text-xl font-medium">Project details</h1>
          </div>
          <div className="flex w-full gap-12">
            <div className="w-32 h-32 bg-slate-500 rounded-full flex items-center justify-center">
              {projectLogoUrl && <img src={projectLogoUrl} className="rounded-full w-32 h-32" />}
              {!projectLogoUrl && <AiFillCamera className="w-8 h-8 text-white" />}
              <input onChange={handleProjectLogoChange} ref={projectLogoInputRef} type="file" accept="image/*" hidden />
            </div>
            <div className="flex items-center gap-8 flex-1">
              {!projectLogoFile && (
                <Button
                  onClick={handleProjectLogoSelectClick}
                  className="w-2/4 justify-center"
                  variant="primary-outline"
                >
                  Select Logo
                </Button>
              )}
              {projectLogoFile && (
                <Button
                  onClick={handleProjectLogoResetClick}
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
                    onChange={handleProjectLogoUrlChange}
                    disabled={projectLogoFile !== null}
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
            <label htmlFor="projectName" className="block mb-1 text-sm font-medium text-gray-600">
              Project Name
            </label>
            <div className="flex flex-col items-start gap-4">
              <input
                type="text"
                {...register('projectName')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  errors.projectName ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Ex: Build on AO Hackathon"
              />
            </div>
            {errors.projectName && <p className="text-red-500 text-sm italic mt-2">{errors.projectName?.message}</p>}
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

          <div className="w-full flex flex-col">
            <span className="block mb-1 text-sm font-medium text-gray-600">About your project</span>
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
          <div className="w-full flex flex-col gap-2">
            <span className="block text-sm font-medium text-gray-600">Image Links</span>

            <div className="w-full flex flex-col gap-4">
              {imagesFields.map((field, idx) => (
                <div key={field.id} className="w-full">
                  <div className="flex items-center mb-2 gap-4">
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-600">
                      Image #{idx + 1}
                    </label>
                    <span
                      onClick={() => removeImages(idx)}
                      className="text-sm font-medium text-primary-600 flex items-center gap-[2px] cursor-pointer"
                    >
                      <FaTrash className="w-3 h-3" />
                      Delete
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-4">
                    <input
                      type="text"
                      {...register(`images.${idx}.url`)}
                      className={clsx(
                        'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-5000 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                        errors.images && errors.images[idx] && errors.images[idx]?.url
                          ? 'border-red-500'
                          : 'border-gray-300'
                      )}
                      placeholder="Ex: https://example.com/image.png"
                    />
                  </div>
                  {errors.images && errors.images[idx] && errors.images[idx]?.url && (
                    <p className="text-red-500 text-sm italic mt-2">{errors.images[idx]?.url?.message}</p>
                  )}
                </div>
              ))}

              <span
                onClick={() => appendEmptyImage()}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-[2px] cursor-pointer"
              >
                <FaPlus className="w-3 h-3" />
                Add Image
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="block text-sm font-medium text-gray-600">
              Links (Protocol.Land, Github, Figma, Website, etc.)
            </span>

            <div className="w-full flex flex-col gap-4">
              {linksFields.map((field, idx) => (
                <div key={field.id} className="w-full">
                  <div className="flex items-center mb-2 gap-4">
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-600">
                      Link #{idx + 1}
                    </label>
                    <span
                      onClick={() => removeLinks(idx)}
                      className="text-sm font-medium text-primary-600 flex items-center gap-[2px] cursor-pointer"
                    >
                      <FaTrash className="w-3 h-3" />
                      Delete
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-4">
                    <input
                      type="text"
                      {...register(`links.${idx}.url`)}
                      className={clsx(
                        'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-5000 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                        errors.links && errors.links[idx] && errors.links[idx]?.url
                          ? 'border-red-500'
                          : 'border-gray-300'
                      )}
                      placeholder="Ex: https://protocol.land/#/repository/6ace6247-d267-463d-b5bd-7e50d98c3693"
                    />
                  </div>
                  {errors.links && errors.links[idx] && errors.links[idx]?.url && (
                    <p className="text-red-500 text-sm italic mt-2">{errors.links[idx]?.url?.message}</p>
                  )}
                </div>
              ))}

              <span
                onClick={() => appendEmptyLink()}
                className="text-sm font-medium text-primary-600 hover:text-primary-7000 flex items-center gap-[2px] cursor-pointer"
              >
                <FaPlus className="w-3 h-3" />
                Add Link
              </span>
            </div>
          </div>
          <div className="w-full">
            <label htmlFor="projectName" className="block mb-1 text-sm font-medium text-gray-600">
              Technologies Used
            </label>
            <div className="flex flex-col items-start gap-4">
              <input
                type="text"
                {...register('technologiesUsed')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  errors.technologiesUsed ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Ex: React, AO, Arweave, NodeJS"
              />
            </div>
            {errors.technologiesUsed && (
              <p className="text-red-500 text-sm italic mt-2">{errors.technologiesUsed?.message}</p>
            )}
          </div>
          <div className="w-full">
            <label htmlFor="projectName" className="block mb-1 text-sm font-medium text-gray-600">
              Demo Video URL
            </label>
            <div className="flex flex-col items-start gap-4">
              <input
                type="text"
                {...register('video')}
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  errors.video ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Ex: https://www.youtube.com/watch?v=1234567890"
              />
            </div>
            {errors.video && <p className="text-red-500 text-sm italic mt-2">{errors.video?.message}</p>}
          </div>
        </div>

        {(!selectedSubmission || (selectedSubmission && selectedSubmission.status === 'DRAFT')) && (
          <div className="w-full flex items-center justify-center gap-8">
            <Button
              isLoading={draftStatus === 'PENDING'}
              disabled={draftStatus === 'PENDING'}
              onClick={handleSubmit(handleProjectSave)}
              variant="primary-outline"
              className="w-44 justify-center"
            >
              Save Draft
            </Button>
            <Button
              isLoading={status === 'PENDING'}
              disabled={status === 'PENDING'}
              onClick={handleSubmit(handleProjectSubmit)}
              variant="primary-solid"
              className="w-44 justify-center"
            >
              Submit
            </Button>
          </div>
        )}
        {selectedSubmission && selectedSubmission.status === 'PUBLISHED' && (
          <div className="w-full flex items-center justify-center gap-8">
            <Button
              isLoading={draftStatus === 'PENDING'}
              disabled={draftStatus === 'PENDING'}
              onClick={handleSubmit(handleProjectSave)}
              variant="primary-solid"
              className="w-44 justify-center"
            >
              Update Submission
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
