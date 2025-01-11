import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import ReactMde from 'react-mde'
import * as Showdown from 'showdown'
import * as yup from 'yup'

import { Button } from '@/components/common/buttons'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { withAsync } from '@/helpers/withAsync'
import { uploadUserReadMe } from '@/lib/user'
import { useGlobalStore } from '@/stores/globalStore'

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
})
converter.setFlavor('github')

const schema = yup
  .object({
    name: yup.string().required('Name is required'),
    description: yup.string(),
    about: yup.string(),
    website: yup.string()
  })
  .required()

type Payload = {
  name?: string
  description?: string
  website?: string
  readmeTxId?: string
  about?: string
}

export default function SettingsTab() {
  const [submitting, setSubmitting] = React.useState(false)
  const [originalContent, setOriginalContent] = React.useState('')
  const [content, setContent] = React.useState('')
  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>('write')
  const [selectedOrganization, updateOrganizationDetails] = useGlobalStore((state) => [
    state.organizationState.selectedOrganization,
    state.organizationActions.updateOrganizationDetails
  ])
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: selectedOrganization?.organization?.name,
      description: selectedOrganization?.organization?.description,
      about: content,
      website: selectedOrganization?.organization?.website
    }
  })

  React.useEffect(() => {
    setValue('about', content)
    trigger('about')
  }, [content])

  React.useEffect(() => {
    if (selectedOrganization.organization && selectedOrganization.organization.readmeTxId) {
      fetchReadMe(selectedOrganization.organization.readmeTxId)
    }
  }, [selectedOrganization])

  async function fetchReadMe(txId: string) {
    const response = await fetch(`https://arweave.net/${txId}`)
    if (!response.ok) {
      return
    }
    const data = await response.text()
    setOriginalContent(data)
    setContent(data)
    setValue('about', data)
    trigger('about')
  }

  async function handleSaveButtonClick(data: yup.InferType<typeof schema>) {
    if (!selectedOrganization || !selectedOrganization.organization) return
    setSubmitting(true)

    const updatedFields = getUpdatedFields(selectedOrganization.organization, data)

    const payload: Payload = {
      ...updatedFields
    }

    delete payload.about

    if (payload.readmeTxId === selectedOrganization.organization.readmeTxId) {
      delete payload.readmeTxId
    }

    if (originalContent !== content && content.length > 0) {
      const { response } = await withAsync(() => uploadUserReadMe(content))
      if (response) {
        setOriginalContent(content)
        payload.readmeTxId = response
      }
    }

    if (!Object.keys(payload).length) {
      setSubmitting(false)
      return
    }

    const result = await updateOrganizationDetails(selectedOrganization.organization.id, payload)

    if (result) {
      toast.success('Organization details updated')
    } else {
      toast.error('Failed to update organization details')
    }

    setSubmitting(false)
  }

  function getUpdatedFields(
    originalData: Partial<yup.InferType<typeof schema>>,
    updatedData: Partial<yup.InferType<typeof schema>>
  ): Partial<yup.InferType<typeof schema>> {
    const changes: Partial<yup.InferType<typeof schema>> = {}

    Object.keys(updatedData).forEach((key: string) => {
      const typedKey = key as keyof yup.InferType<typeof schema>

      if (
        !isInvalidInput(updatedData[typedKey], ['string', 'boolean'], true) &&
        originalData[typedKey] !== updatedData[typedKey]
      ) {
        changes[typedKey] = updatedData[typedKey]
      }
    })

    return changes
  }

  async function handleDeleteOrganization() {
    toast.success('Coming soon')
  }

  return (
    <div>
      <div className="mt-2 space-y-4">
        <div className="rounded-lg border bg-transparent shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Organization Settings</h3>
            <p className="text-sm text-gray-500">Manage your organization's profile and settings</p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label htmlFor="org-name" className="text-sm font-medium">
                Organization Name
              </label>
              <input
                placeholder="Protocol Land"
                {...register('name')}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                id="org-name"
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="org-description" className="text-sm font-medium">
                Description
              </label>
              <input
                placeholder="Building the next generation of the decentralized Organization"
                {...register('description')}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                id="org-description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">About</label>
              <ReactMde
                value={content}
                onChange={setContent}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) => Promise.resolve(converter.makeHtml(markdown))}
                classes={{
                  reactMde: '!rounded-md !border-gray-200 overflow-hidden',
                  preview: 'bg-white',
                  textArea: 'outline-none',
                  toolbar:
                    '[&>.mde-tabs>button.selected]:!bg-white [&>.mde-tabs>button.selected]:!border-gray-200 [&>.mde-tabs>button]:!rounded-md [&>.mde-tabs>button]:!px-2 [&>.mde-tabs>button]:!py-1 [&>.mde-tabs>button]:!text-sm'
                }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="org-website" className="text-sm font-medium">
                Website
              </label>
              <input
                placeholder="https://protocol.land"
                {...register('website')}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                id="org-website"
              />
            </div>

            <Button
              disabled={submitting}
              isLoading={submitting}
              onClick={handleSubmit(handleSaveButtonClick)}
              variant="primary-solid"
              className="h-10 text-sm rounded-md !mt-8"
            >
              Save Changes
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-transparent shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Danger Zone</h3>
            <p className="text-sm text-gray-500">Irreversible and destructive actions</p>
          </div>
          <div className="p-6 pt-0">
            <Button
              onClick={handleDeleteOrganization}
              variant="primary-solid"
              className="h-10 text-sm rounded-md bg-red-500 hover:bg-red-600 active:bg-red-700"
            >
              Delete Organization
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
