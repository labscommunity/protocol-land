import { Organization } from '@/types/orgs'
import { Repo } from '@/types/repository'

export interface OrganizationSlice {
  organizationState: OrganizationState
  organizationActions: OrganizationActions
}

export type OrganizationState = {
  selectedOrganization: {
    status: ApiStatus
    error: unknown | null
    organization: Organization | null
    repositories: Repo[]
    isInvitedMember: boolean
  }
}

export type OrganizationActions = {
  isOrganizationNameAvailable: (name: string) => Promise<boolean>
  createOrganization: (id: string, name: string, username: string, description: string) => Promise<string | null>
  updateOrganizationDetails: (id: string, data: Partial<Organization>) => Promise<boolean>
  inviteMember: (id: string, address: string, role: string) => Promise<boolean>
  acceptInvite: (id: string) => Promise<boolean>
  rejectInvite: (id: string) => Promise<boolean>
  cancelInvite: (id: string, address: string) => Promise<boolean>
  fetchAndLoadOrganization: (id: string) => Promise<void>
  // fetchOrgRepos: () => Promise<void>
  // isOrgMember: () => boolean
  // isOrgAdmin: () => boolean
  // isOrgOwner: () => boolean
  reset: () => void
}
