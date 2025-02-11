import { StateCreator } from 'zustand'

import { withAsync } from '@/helpers/withAsync'

import { CombinedSlices } from '../types'
import {
  acceptInvite,
  cancelInvite,
  createOrganization,
  getOrganizationById,
  getOrganizationNameAvailability,
  getOrganizationRepos,
  inviteMember,
  rejectInvite,
  updateOrganization
} from './actions'
import { OrganizationSlice, OrganizationState } from './types'

const initialOrganizationState: OrganizationState = {
  selectedOrganization: {
    status: 'IDLE',
    error: null,
    organization: null,
    isInvitedMember: false,
    repositories: []
  }
}

const createOrganizationSlice: StateCreator<
  CombinedSlices,
  [['zustand/immer', never], never],
  [],
  OrganizationSlice
> = (set, get) => ({
  organizationState: initialOrganizationState,
  organizationActions: {
    isOrganizationNameAvailable: async (name: string) => {
      const { error, response } = await withAsync(() => getOrganizationNameAvailability(name))
      if (error || !response) {
        return false
      }
      return response
    },
    createOrganization: async (id: string, name: string, username: string, description: string) => {
      const { error, response } = await withAsync(() => createOrganization(id, name, username, description))
      if (error || !response) {
        return null
      }

      return response
    },
    fetchAndLoadOrganization: async (id: string) => {
      const { error, response } = await withAsync(() => getOrganizationById(id))
      if (error || !response) {
        set((state) => {
          state.organizationState.selectedOrganization.status = 'ERROR'
          state.organizationState.selectedOrganization.error = error
        })
        return
      }

      set((state) => {
        state.organizationState.selectedOrganization.status = 'SUCCESS'
        state.organizationState.selectedOrganization.organization = response
      })

      const { error: reposError, response: reposResponse } = await withAsync(() => getOrganizationRepos(response.id))
      if (reposError || !reposResponse) {
        return
      }

      set((state) => {
        state.organizationState.selectedOrganization.repositories = reposResponse
      })
    },
    updateOrganizationDetails: async (id, data) => {
      const { error } = await withAsync(() => updateOrganization(id, data))
      if (error) {
        return false
      }

      await get().organizationActions.fetchAndLoadOrganization(id)

      return true
    },
    inviteMember: async (id: string, address: string, role: string) => {
      const { error } = await withAsync(() => inviteMember(id, address, role))
      if (error) {
        return false
      }

      await get().organizationActions.fetchAndLoadOrganization(id)

      return true
    },
    acceptInvite: async (id: string) => {
      const { error } = await withAsync(() => acceptInvite(id))
      if (error) {
        return false
      }

      await get().organizationActions.fetchAndLoadOrganization(id)

      return true
    },
    rejectInvite: async (id: string) => {
      const { error } = await withAsync(() => rejectInvite(id))
      if (error) {
        return false
      }

      await get().organizationActions.fetchAndLoadOrganization(id)

      return true
    },
    cancelInvite: async (id: string, address: string) => {
      const { error } = await withAsync(() => cancelInvite(id, address))
      if (error) {
        return false
      }

      await get().organizationActions.fetchAndLoadOrganization(id)

      return true
    },
    isOrgMember: () => {
      return !!get().organizationState.selectedOrganization.organization?.members.find(
        (member) => member.address === get().authState.address
      )
    },
    isOrgAdmin: () => {
      return !!get().organizationState.selectedOrganization.organization?.members.find(
        (member) => member.address === get().authState.address && member.role === 'admin'
      )
    },
    isOrgOwner: () => {
      return get().organizationState.selectedOrganization.organization?.owner === get().authState.address
    },
    reset: () => {
      set((state) => {
        state.organizationState.selectedOrganization = initialOrganizationState.selectedOrganization
      })
    }
  }
})

export default createOrganizationSlice
