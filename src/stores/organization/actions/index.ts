import { Tag } from 'arweave/web/lib/transaction'

import { dryrun, result } from '@/helpers/aoconnect'
import { AOS_PROCESS_ID } from '@/helpers/constants'
import { getTags } from '@/helpers/getTags'
import { sendMessage } from '@/lib/contract'
import { useGlobalStore } from '@/stores/globalStore'
import { Organization } from '@/types/orgs'
import { Repo } from '@/types/repository'

export const getOrganizationNameAvailability = async (name: string): Promise<boolean> => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Organization-Name-Availability',
      Name: name
    }),
    Owner: useGlobalStore.getState().authState.address as string
  })

  return JSON.parse(Messages[0].Data).result
}

export const createOrganization = async (
  id: string,
  name: string,
  username: string,
  description: string
): Promise<string> => {
  const msgId = await sendMessage({
    pid: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Create-Organization', Id: id, Name: name, Username: username, Description: description })
  })

  const { Messages } = await result({
    message: msgId,
    process: AOS_PROCESS_ID
  })

  if (!Messages || !Messages.length || !Messages[0]) {
    throw new Error('Failed to create organization')
  }

  const organizationId = Messages[0].Tags.find((tag: Tag) => tag.name === 'Org-Id')

  if (!organizationId || !organizationId.value) {
    throw new Error('Failed to create organization')
  }

  return organizationId.value
}

export const updateOrganization = async (id: string, data: Partial<Organization>): Promise<void> => {
  const tags = getTags({ Action: 'Update-Organization-Details', Id: id })
  Object.keys(data).forEach((key) => {
    const val = data[key as keyof Organization] as string

    tags.push({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: val.charAt(0).toUpperCase() + val.slice(1)
    } as Tag)
  })

  console.log(tags)
  const msgId = await sendMessage({
    pid: AOS_PROCESS_ID,
    tags
  })

  const { Messages } = await result({
    message: msgId,
    process: AOS_PROCESS_ID
  })

  if (!Messages || !Messages.length || !Messages[0]) {
    throw new Error('Failed to update organization')
  }

  const action = Messages[0].Tags.find((tag: Tag) => tag.name === 'Action')

  if (action?.value !== 'Organization-Details-Updated') {
    throw new Error('Failed to update organization')
  }
}

export const inviteMember = async (id: string, address: string, role: string): Promise<void> => {
  const msgId = await sendMessage({
    pid: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Invite-Member', Id: id, Member: address, Role: role })
  })

  const { Messages } = await result({
    message: msgId,
    process: AOS_PROCESS_ID
  })

  if (!Messages || !Messages.length || !Messages[0]) {
    throw new Error('Failed to invite member')
  }

  const action = Messages[0].Tags.find((tag: Tag) => tag.name === 'Action')

  if (action?.value !== 'Organization-Member-Invited') {
    throw new Error('Failed to invite member')
  }
}

export const acceptInvite = async (id: string): Promise<void> => {
  const msgId = await sendMessage({
    pid: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Accept-Member-Invite', Id: id })
  })

  const { Messages } = await result({
    message: msgId,
    process: AOS_PROCESS_ID
  })

  if (!Messages || !Messages.length || !Messages[0]) {
    throw new Error('Failed to accept invite')
  }

  const action = Messages[0].Tags.find((tag: Tag) => tag.name === 'Action')

  if (action?.value !== 'Organization-Member-Invite-Accepted') {
    throw new Error('Failed to accept invite')
  }
}

export const rejectInvite = async (id: string): Promise<void> => {
  const msgId = await sendMessage({
    pid: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Reject-Member-Invite', Id: id })
  })

  const { Messages } = await result({
    message: msgId,
    process: AOS_PROCESS_ID
  })

  if (!Messages || !Messages.length || !Messages[0]) {
    throw new Error('Failed to reject invite')
  }

  const action = Messages[0].Tags.find((tag: Tag) => tag.name === 'Action')

  if (action?.value !== 'Organization-Member-Invite-Rejected') {
    throw new Error('Failed to reject invite')
  }
}

export const cancelInvite = async (id: string, address: string): Promise<void> => {
  const msgId = await sendMessage({
    pid: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Cancel-Member-Invite', Id: id, Member: address })
  })

  const { Messages } = await result({
    message: msgId,
    process: AOS_PROCESS_ID
  })

  if (!Messages || !Messages.length || !Messages[0]) {
    throw new Error('Failed to cancel invite')
  }

  const action = Messages[0].Tags.find((tag: Tag) => tag.name === 'Action')

  if (action?.value !== 'Organization-Member-Invite-Cancelled') {
    throw new Error('Failed to cancel invite')
  }
}

export const getOrganizationById = async (id: string): Promise<Organization> => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-Organization-By-Id', Id: id })
  })

  if (!Messages || !Messages.length || !Messages[0] || !Messages[0].Data) {
    throw new Error('Failed to get organization')
  }

  const organization = JSON.parse(Messages[0].Data).result

  if (!organization) {
    throw new Error('Failed to get organization')
  }

  return organization
}

export const getOrganizationRepos = async (id: string): Promise<Repo[]> => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-Repos-By-Organization-Id', 'Org-Id': id })
  })

  if (!Messages || !Messages.length || !Messages[0] || !Messages[0].Data) {
    throw new Error('Failed to get organization repositories')
  }

  const repositories = JSON.parse(Messages[0].Data).result

  return repositories
}
