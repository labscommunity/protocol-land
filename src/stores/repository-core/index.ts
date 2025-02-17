import toast from 'react-hot-toast'
import { StateCreator } from 'zustand'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { withAsync } from '@/helpers/withAsync'
import {
  addActivePubKeyToPrivateState,
  addContributor,
  addDeployment,
  addDomain,
  githubSyncAllowPending,
  inviteContributor,
  updateDomain,
  updateGithubSync,
  updateRepoDeploymentBranch,
  updateRepoDescription,
  updateRepoName
} from '@/lib/git'
import { prepareNodesAndEdgesFromRepo } from '@/pages/repository/components/tabs/forks-tab/utils/prepareNodesAndEdgesFromRepo'
import { useRepoHeaderStore } from '@/pages/repository/store/repoHeader'
import { Deployment, Domain, GithubSync } from '@/types/repository'

import { changeBranch, getBranchList, getCurrentActiveBranch } from '../branch/actions'
import { getOrganizationById } from '../organization/actions'
import { CombinedSlices } from '../types'
import {
  countCommits,
  decryptPAT,
  fetchRepoHierarchy,
  getFileContentFromOid,
  getFilesFromOid,
  getOidOfHeadRef,
  getRepositoryMetaFromContract,
  handleAcceptContributor,
  handleCancelContributorInvite,
  handleRejectContributor,
  handleSaveBondingCurveId,
  handleSaveForkedImportTokenDetails,
  handleSaveImportedTokenId,
  handleSaveLiquidityPoolId,
  handleSaveRepoBondingCurve,
  handleSaveRepoToken,
  handleTransferOwnership,
  handleTransferOwnershipToOrganization,
  loadRepository,
  renameRepoDir,
  saveRepository
} from './actions'
import { RepoCoreSlice, RepoCoreState } from './types'

const initialRepoCoreState: RepoCoreState = {
  selectedRepo: {
    status: 'IDLE',
    error: null,
    repo: null,
    organization: null,
    repoHierarchy: {
      edges: [],
      nodes: []
    },
    statistics: {
      commits: [],
      pullRequests: [],
      issues: []
    },
    isInvitedContributor: false,
    isPrivateRepo: false
  },
  parentRepo: {
    status: 'IDLE',
    error: null,
    repo: null
  },
  forkRepo: {
    status: 'IDLE',
    error: null,
    repo: null
  },
  git: {
    status: 'IDLE',
    error: null,
    rootOid: '',
    currentOid: '',
    fileObjects: [],
    parentsOidList: [],
    commits: [],
    commitSourceBranch: '',
    isCreateNewFile: false
  }
}

const createRepoCoreSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], RepoCoreSlice> = (
  set,
  get
) => ({
  repoCoreState: initialRepoCoreState,
  repoCoreActions: {
    reset: () => {
      set((state) => {
        state.repoCoreState = initialRepoCoreState
      })
    },
    fetchRepoHierarchy: async () => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        toast.error('Repository not found.')
        return
      }

      const { error, response } = await withAsync(() => fetchRepoHierarchy(repo.id))
      if (error || !response.result) {
        toast.error('Failed to fetch repo hierarchy.')
        return
      }

      const hierarchy = prepareNodesAndEdgesFromRepo(response.result, repo.id)

      set((state) => {
        state.repoCoreState.selectedRepo.repoHierarchy = hierarchy
      })
    },
    setRepoDecentralized: () => {
      const repo = get().repoCoreState.selectedRepo.repo
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        toast.error('Not authorized to toggle decentralization.')
        return
      }
      if (repo.decentralized) {
        toast.error('Repository is already decentralized')
        return
      }

      set((state) => {
        state.repoCoreState.selectedRepo.repo!.decentralized = true
      })
    },
    saveRepoTokenDetails: async (details) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        toast.error('Not authorized to update token.')
        return
      }

      const { error, response } = await withAsync(() => handleSaveRepoToken(repo.id, details))

      if (error) {
        toast.error('Failed to save token.')
        return
      }

      if (response && response.token && response.bondingCurve) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.token = response.token
          state.repoCoreState.selectedRepo.repo!.bondingCurve = response.bondingCurve
        })
        toast.success('Token saved.')
      }
    },
    saveImportedTokenId: async (importedTokenId) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        toast.error('Not authorized to save imported token id.')
        return
      }

      const { error, response } = await withAsync(() => handleSaveImportedTokenId(repo.id, importedTokenId))

      if (error || !response) {
        toast.error('Failed to save imported token id.')
        return
      }

      if (response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.token!.processId = importedTokenId
          state.repoCoreState.selectedRepo.repo!.tokenType = 'IMPORT'
        })
        toast.success('Imported token id saved.')
      }
    },
    saveRepoBondingCurveDetails: async (bondingCurve) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        toast.error('Not authorized to update token.')
        return
      }

      const { error, response } = await withAsync(() => handleSaveRepoBondingCurve(repo.id, bondingCurve, userAddress))

      if (error) {
        toast.error('Failed to save bonding curve.')
        return
      }

      if (response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.bondingCurve = response
        })
        toast.success('Bonding curve saved.')
      }
    },
    saveBondingCurveId: async (bondingCurveId) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        toast.error('Not authorized to save bonding curve id.')
        return
      }

      const { error } = await withAsync(() => handleSaveBondingCurveId(repo.id, bondingCurveId))

      if (error) {
        toast.error('Failed to save bonding curve id.')
        return
      }
    },
    saveForkedImportTokenDetails: async (token) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        toast.error('Not authorized to save forked import token details.')
        return
      }

      const { error, response } = await withAsync(() => handleSaveForkedImportTokenDetails(repo.id, token))

      if (error || !response) {
        toast.error('Failed to save forked import token details.')
        return
      }

      if (response) {
        const updatedRes = { ...response, processId: repo?.token?.processId }
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.token = updatedRes
        })
        toast.success('Forked import token details saved.')
      }
    },
    saveLiquidityPoolId: async (liquidityPoolId) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        toast.error('Not authorized to save liquidity pool id.')
        return
      }

      const { error } = await withAsync(() => handleSaveLiquidityPoolId(repo.id, liquidityPoolId))

      if (error) {
        toast.error('Failed to save liquidity pool id.')
        return
      }
    },
    setRepoTokenProcessId: (processId) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        toast.error('Not authorized to update token.')
        return
      }

      const token = repo.token

      if (!token) {
        toast.error('Token not found.')
        return
      }

      set((state) => {
        state.repoCoreState.selectedRepo.repo!.token!.processId = processId
      })
    },
    isRepoOwner: () => {
      const repo = get().repoCoreState.selectedRepo.repo
      const organization = get().repoCoreState.selectedRepo.organization
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        return false
      }

      const isOwner = repo.owner === userAddress

      if (isOwner) {
        return true
      }

      if (organization) {
        const isOrgMember = organization.members.find((member) => member.address === userAddress)
        const isOrgAdmin = organization.members.find((admin) => admin.role === 'ADMIN' || admin.role === 'OWNER')

        const hasAccess = isOrgMember && isOrgAdmin ? true : false

        return hasAccess
      }

      return false
    },
    isContributor: () => {
      const repo = get().repoCoreState.selectedRepo.repo
      const organization = get().repoCoreState.selectedRepo.organization
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        return false
      }

      const isRepoDecentralized = repo?.decentralized === true

      if (isRepoDecentralized) {
        return false
      }

      const isRepoOwner = repo.owner === userAddress

      if (isRepoOwner) return true

      const isContributor = repo?.contributors?.indexOf(userAddress) > -1

      if (isContributor) {
        return true
      }

      if (repo.organizationId && organization) {
        const isOrgMember = organization.members.find((member) => member.address === userAddress)
        if (isOrgMember) {
          return true
        }
      }

      return false
    },
    updateRepoName: async (name: string) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => updateRepoName(repo.id, name))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.name = name
        })
      }

      if (error) throw error
    },
    updateRepoDescription: async (description: string) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => updateRepoDescription(description, repo.id))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.description = description
        })

        trackGoogleAnalyticsEvent('Repository', 'Update repo description', 'Update description', {
          repo_name: repo.name,
          repo_id: repo.id,
          description,
          result: 'SUCCESS'
        })
      }

      if (error) throw error
    },
    updateRepoDeploymentBranch: async (deploymentBranch: string) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => updateRepoDeploymentBranch(deploymentBranch, repo.id))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.deploymentBranch = deploymentBranch
        })

        trackGoogleAnalyticsEvent('Repository', 'Update default deployment branch', 'Update deployment branch', {
          repo_name: repo.name,
          repo_id: repo.id,
          deploymentBranch,
          result: 'SUCCESS'
        })
      }

      if (error) throw error
    },
    getGitHubPAT: async () => {
      const repo = get().repoCoreState.selectedRepo.repo!

      if (!repo.githubSync || !repo.githubSync?.accessToken || !repo.githubSync?.privateStateTxId) return ''

      const { response, error } = await withAsync(() =>
        decryptPAT(repo.githubSync?.accessToken as string, repo.githubSync?.privateStateTxId as string)
      )
      if (response) {
        return response
      } else {
        throw error
      }
    },
    updateGithubSync: async (githubSync: GithubSync) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() =>
        updateGithubSync({ id: repo.id, currentGithubSync: repo.githubSync, githubSync })
      )

      if (!error && response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.githubSync = response
        })
        trackGoogleAnalyticsEvent('Repository', 'Update GitHub Sync Settings', 'Update GitHub Sync', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        throw error
      }
    },
    githubSyncAllowPending: async () => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() =>
        githubSyncAllowPending(repo.id, repo.githubSync?.privateStateTxId as string)
      )

      if (!error && response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.githubSync = response
        })
        trackGoogleAnalyticsEvent('Repository', 'Update GitHub Sync Settings', 'Update GitHub Sync', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'SUCCESS'
        })
      } else {
        throw error
      }
    },
    triggerGithubSync: async (options?: { manualTrigger?: boolean; forcePush?: boolean }) => {
      const { manualTrigger = false, forcePush = false } = options ?? {}
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const githubSync = repo.githubSync
      if (!githubSync || (!githubSync?.enabled && !manualTrigger)) return

      const connectedAddress = get().authState.address
      const isAllowed = githubSync.allowed.findIndex((address) => address === connectedAddress) > -1

      if (!isAllowed || !githubSync.repository || !githubSync.workflowId || !githubSync.branch) return

      const accessToken = await get().repoCoreActions.getGitHubPAT()

      if (!accessToken) return

      const response = await fetch(
        `https://api.github.com/repos/${githubSync?.repository}/actions/workflows/${githubSync?.workflowId}/dispatches`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            ref: githubSync?.branch,
            inputs: { forcePush: forcePush.toString(), repoId: repo.id }
          })
        }
      )

      if (response.status !== 204) {
        throw new Error('Failed to Sync to GitHub')
      }
    },
    setRepoContributionStats: (data) => {
      set((state) => {
        state.repoCoreState.selectedRepo.statistics = data
      })
    },
    addContributor: async (address: string) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => addContributor(address, repo.id))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.contributors.push(address)
        })

        trackGoogleAnalyticsEvent('Repository', 'Add contributor to a repo', 'Add repo contributor', {
          repo_name: repo.name,
          repo_id: repo.id,
          contributor_address: address,
          result: 'SUCCESS'
        })
      } else {
        throw error
      }
    },
    addDeployment: async (deployment: Omit<Deployment, 'deployedBy' | 'branch' | 'timestamp'>) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => addDeployment(deployment, repo.id))

      if (!error && response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.deployments.push(response)
        })

        trackGoogleAnalyticsEvent('Repository', 'Add deployment to a repo', 'Add repo deployment', {
          repo_name: repo.name,
          repo_id: repo.id,
          deployment,
          result: 'SUCCESS'
        })
        return response
      }
      if (error) {
        throw error
      }
    },
    addDomain: async (domain: Omit<Domain, 'timestamp'>) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { response, error } = await withAsync(() => addDomain(domain, repo.id))

      if (!error && response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.domains = response
        })

        trackGoogleAnalyticsEvent('Repository', 'Add domain to a repo', 'Add repo domain', {
          repo_name: repo.name,
          repo_id: repo.id,
          domain,
          result: 'SUCCESS'
        })
      } else {
        throw error
      }
    },
    updateDomain: async (domain: Omit<Domain, 'controller' | 'timestamp'>) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { response, error } = await withAsync(() => updateDomain(domain, repo.id))

      if (!error && response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.domains = response
        })

        trackGoogleAnalyticsEvent('Repository', 'Update domain in a repo', 'Update repo domain', {
          repo_name: repo.name,
          repo_id: repo.id,
          domain,
          result: 'SUCCESS'
        })
      } else {
        throw error
      }
    },
    inviteContributor: async (address: string) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => inviteContributor(address, repo.id))

      if (!error && response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.contributorInvites = response
        })

        trackGoogleAnalyticsEvent('Repository', 'Invite contributor to a repo', 'Invite repo contributor', {
          repo_name: repo.name,
          repo_id: repo.id,
          contributor_address: address,
          result: 'SUCCESS'
        })

        return { status: true }
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Invite contributor to a repo', 'Invite repo contributor', {
          repo_name: repo.name,
          repo_id: repo.id,
          contributor_address: address,
          result: 'FAILED'
        })

        return { status: false, response: (error as any)?.message }
      }
    },
    acceptContributor: async () => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const visibility = repo.private ? 'private' : 'public'
      let privateStateTxId: string | null = null
      let ghSyncPrivateStateTxId: string | null = null

      if (repo.private && repo.privateStateTxId) {
        const updatedPrivateStateTxId = await addActivePubKeyToPrivateState(repo.id, repo.privateStateTxId)

        privateStateTxId = updatedPrivateStateTxId
      }

      if (repo.githubSync && repo.githubSync.privateStateTxId) {
        const updatedPrivateStateTxId = await addActivePubKeyToPrivateState(
          repo.id,
          repo.githubSync.privateStateTxId,
          'GITHUB_SYNC'
        )
        ghSyncPrivateStateTxId = updatedPrivateStateTxId
      }

      const { error, response } = await withAsync(() =>
        handleAcceptContributor(repo.id, visibility, privateStateTxId, ghSyncPrivateStateTxId)
      )

      if (!error && response) {
        if (!repo.private) {
          set((state) => {
            state.repoCoreState.selectedRepo.repo!.contributorInvites = response.contributorInvites
            state.repoCoreState.selectedRepo.repo!.contributors = response.contributors
            if (response.githubSync) {
              state.repoCoreState.selectedRepo.repo!.githubSync = response.githubSync
            }
          })
        }
        trackGoogleAnalyticsEvent('Repository', 'Accept contributor invite', 'Accept repo contributor invite', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'SUCCESS'
        })
      } else {
        trackGoogleAnalyticsEvent('Repository', 'Accept contributor invite', 'Accept repo contributor invite', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'FAILED'
        })
      }
    },
    transferOwnership: async (address: string) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const loggedInAddress = get().authState.address

      if (!loggedInAddress) {
        toast.error('You must be logged in to transfer ownership')
        return
      }

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      if (repo.owner !== loggedInAddress) {
        toast.error('You must be the owner of the repository to transfer ownership')
        return
      }

      const { error } = await withAsync(() => handleTransferOwnership(repo.id, address))

      if (error) {
        toast.error('Failed to transfer ownership')
        return
      }

      toast.success('Ownership transferred successfully')
      trackGoogleAnalyticsEvent('Repository', 'Transfer ownership', 'Transfer repo ownership', {
        repo_name: repo.name,
        repo_id: repo.id,
        result: 'SUCCESS'
      })
      await get().repoCoreActions.fetchAndLoadRepository(repo.id)
    },
    transferOwnershipToOrganization: async (orgId: string) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const loggedInAddress = get().authState.address

      if (!loggedInAddress) {
        toast.error('You must be logged in to transfer ownership')
        return
      }

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      if (repo.owner !== loggedInAddress) {
        toast.error('You must be the owner of the repository to transfer ownership')
        return
      }

      if (repo.organizationId) {
        toast.error('Repository already belongs to an organization')
        return
      }

      const { error, response } = await withAsync(() => getOrganizationById(orgId))

      if (error || !response) {
        toast.error('Failed to get organization')
        return
      }

      const userAdmin = response.members.find(
        (member) =>
          (member.address === loggedInAddress && member.role === 'ADMIN') ||
          (member.address === loggedInAddress && member.role === 'OWNER')
      )

      if (!userAdmin) {
        toast.error('You must be an admin or owner of the organization to transfer ownership')
        return
      }

      const { error: transferError } = await withAsync(() => handleTransferOwnershipToOrganization(repo.id, orgId))

      if (transferError) {
        toast.error('Failed to transfer ownership')
        return
      }

      trackGoogleAnalyticsEvent(
        'Repository',
        'Transfer ownership to organization',
        'Transfer repo ownership to organization',
        {
          repo_name: repo.name,
          repo_id: repo.id,
          org_id: orgId,
          result: 'SUCCESS'
        }
      )

      await get().repoCoreActions.fetchAndLoadRepository(repo.id)
    },
    rejectContributor: async () => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => handleRejectContributor(repo.id))

      if (!error && response) {
        if (!repo.private) {
          set((state) => {
            state.repoCoreState.selectedRepo.repo!.contributorInvites = response.contributorInvites
          })
        }
        trackGoogleAnalyticsEvent('Repository', 'Reject contributor invite', 'Reject repo contributor invite', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'SUCCESS'
        })
      } else {
        trackGoogleAnalyticsEvent('Repository', 'Reject contributor invite', 'Reject repo contributor invite', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'FAILED'
        })
        throw error
      }
    },
    cancelContributor: async (contributor) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => handleCancelContributorInvite(repo.id, contributor))

      if (!error && response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.contributorInvites = response
        })

        trackGoogleAnalyticsEvent('Repository', 'Cancel contributor invite', 'Cancel repo contributor invite', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'SUCCESS'
        })
      } else {
        trackGoogleAnalyticsEvent('Repository', 'Cancel contributor invite', 'Cancel repo contributor invite', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'FAILED'
        })
        throw error
      }
    },
    grantAccessToContributor: async () => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const visibility = repo.private ? 'private' : 'public'
      let privateStateTxId: string | null = null

      if (repo.private && repo.privateStateTxId) {
        const updatedPrivateStateTxId = await addActivePubKeyToPrivateState(repo.id, repo.privateStateTxId)

        privateStateTxId = updatedPrivateStateTxId
      }

      const { error } = await withAsync(() => handleAcceptContributor(repo.id, visibility, privateStateTxId, null))

      if (!error) {
        trackGoogleAnalyticsEvent('Repository', 'Accept contributor invite', 'Accept repo contributor invite', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'SUCCESS'
        })
      } else {
        trackGoogleAnalyticsEvent('Repository', 'Accept contributor invite', 'Accept repo contributor invite', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'FAILED'
        })
        throw error
      }
    },
    fetchAndLoadRepository: async (id: string, branchName?: string) => {
      branchName = branchName || 'master'
      let checkedOutBranch = ''
      try {
        set((state) => {
          state.repoCoreState.selectedRepo.status = 'PENDING'
        })

        const { error: metaError, response: metaResponse } = await withAsync(() => getRepositoryMetaFromContract(id))

        if (metaError || !metaResponse || !metaResponse.result) {
          throw new Error('Error fetching repository meta.')
        }

        if (metaResponse.result.organizationId) {
          const { error: orgError, response: orgResponse } = await withAsync(() =>
            getOrganizationById(metaResponse.result.organizationId!)
          )
          if (orgError || !orgResponse) {
            throw new Error('Error fetching organization.')
          }
          set((state) => {
            state.repoCoreState.selectedRepo.organization = orgResponse
          })
        }

        set((state) => {
          state.repoCoreState.selectedRepo.repo = metaResponse.result
        })

        const {
          id: repoId,
          dataTxId,
          fork,
          parent,
          privateStateTxId,
          contributorInvites,
          uploadStrategy
        } = metaResponse.result

        try {
          const address = get().authState.address

          if (address) {
            const invite = contributorInvites.find(
              (invite) => invite.address === address && invite.status === 'INVITED'
            )

            set((state) => {
              state.repoCoreState.selectedRepo.isInvitedContributor =
                invite && invite.status === 'INVITED' ? true : false
              state.repoCoreState.selectedRepo.isPrivateRepo = privateStateTxId ? true : false
            })
          }
        } catch (err: any) {
          console.log(`Error: ${err}`)
        }
        
        let parentRepoId = null

        if (fork) {
          const { error: parentMetaError, response: parentMetaResponse } = await withAsync(() =>
            getRepositoryMetaFromContract(parent!)
          )

          if (parentMetaError || !parentMetaResponse) {
            throw new Error('Error fetching repository meta.')
          }

          if (repoId !== parentMetaResponse.result.id) {
            parentRepoId = parentMetaResponse.result.id
          }

          await get().repoCoreActions.fetchAndLoadParentRepository(parentMetaResponse.result)
        }

        const { error: repoFetchError, response: repoFetchResponse } = await withAsync(() =>
          loadRepository(repoId, dataTxId, uploadStrategy, privateStateTxId)
        )

        if (fork && parentRepoId && repoId !== parentRepoId) {
          const renamed = await renameRepoDir(repoId, parentRepoId, repoId)

          if (!renamed) throw new Error('Error loading the repository.')
        }

        // Always checkout default master branch if available
        if (!repoFetchError && repoFetchResponse && repoFetchResponse.success) {
          const { error: branchError, result: currentBranch } = await getCurrentActiveBranch(repoId)
          if (!branchError && currentBranch && branchName && currentBranch !== branchName) {
            const { error: changeError } = await changeBranch(repoId, branchName)
            checkedOutBranch = changeError ? currentBranch : (branchName as string)
          } else if (!branchError && currentBranch) {
            checkedOutBranch = currentBranch
          }
        }

        if (repoFetchError || !repoFetchResponse || !repoFetchResponse.success) {
          throw new Error('Error loading the repository.')
        }

        const { error: branchListError, response: branchListResponse } = await withAsync(() => getBranchList(repoId))

        if (branchListResponse && !branchListError && branchListResponse.length > 0) {
          useRepoHeaderStore.getState().setBranches(branchListResponse.length)
        }

        const commitsCount = await countCommits(repoId)

        if (commitsCount && commitsCount > 0) {
          useRepoHeaderStore.getState().setCommits(commitsCount)
        }

        useRepoHeaderStore.getState().setRepoSize(repoFetchResponse.repoSize)

        await get().repoCoreActions.fetchRepoHierarchy()

        set((state) => {
          state.repoCoreState.selectedRepo.status = 'SUCCESS'
        })
      } catch (error: any) {
        set((state) => {
          state.repoCoreState.selectedRepo.error = error.message
          state.repoCoreState.selectedRepo.status = 'ERROR'
        })
      }
      return checkedOutBranch
    },
    fetchAndLoadParentRepository: async (repo) => {
      set((state) => {
        state.repoCoreState.parentRepo.status = 'PENDING'
      })

      const { error: repoFetchError, response: repoFetchResponse } = await withAsync(() =>
        loadRepository(repo.id, repo.dataTxId, repo.uploadStrategy, repo.privateStateTxId)
      )

      if (repoFetchError) {
        set((state) => {
          state.repoCoreState.parentRepo.error = repoFetchError
          state.repoCoreState.parentRepo.status = 'ERROR'
        })
      }

      if (repoFetchResponse && repoFetchResponse.success) {
        set((state) => {
          state.repoCoreState.parentRepo.repo = repo
          state.repoCoreState.parentRepo.status = 'SUCCESS'
        })
      }
    },
    fetchAndLoadForkRepository: async (id: string) => {
      set((state) => {
        state.repoCoreState.forkRepo.status = 'PENDING'
      })

      const { error: metaError, response: metaResponse } = await withAsync(() => getRepositoryMetaFromContract(id))

      if (metaError) {
        set((state) => {
          state.repoCoreState.forkRepo.error = metaError
          state.repoCoreState.forkRepo.status = 'ERROR'
        })
      }

      if (metaResponse) {
        const { error: repoFetchError, response: repoFetchResponse } = await withAsync(() =>
          loadRepository(
            metaResponse.result.id,
            metaResponse.result.dataTxId,
            metaResponse.result.uploadStrategy,
            metaResponse.result.privateStateTxId
          )
        )

        if (repoFetchError) {
          set((state) => {
            state.repoCoreState.forkRepo.error = repoFetchError
            state.repoCoreState.forkRepo.status = 'ERROR'
          })
        }

        if (repoFetchResponse && repoFetchResponse.success) {
          set((state) => {
            state.repoCoreState.forkRepo.repo = metaResponse.result
            state.repoCoreState.forkRepo.status = 'SUCCESS'
          })
        }
      }
    },
    loadFilesFromRepo: async () => {
      set((state) => {
        state.repoCoreState.git.status = 'PENDING'
      })

      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => getOidOfHeadRef(repo.id))

      if (error) {
        set((state) => {
          state.repoCoreState.git.status = 'ERROR'
          state.repoCoreState.git.error = error
        })

        return
      }

      if (response) {
        await get().repoCoreActions.git.readFilesFromOid(response, '')

        set((state) => {
          state.repoCoreState.git.rootOid = response
          state.repoCoreState.git.currentOid = response
          state.repoCoreState.git.status = 'SUCCESS'
        })
      }
    },
    reloadFilesOnCurrentFolder: async () => {
      const currentFolder = get().repoCoreActions.git.getCurrentFolderPath()
      set((state) => {
        state.repoCoreState.git.status = 'PENDING'
      })

      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error, response: rootOid } = await withAsync(() => getOidOfHeadRef(repo.id))

      if (error) {
        set((state) => {
          state.repoCoreState.git.status = 'ERROR'
          state.repoCoreState.git.error = error
        })

        return
      }

      if (rootOid) {
        try {
          const paths = ['', ...currentFolder.split('/')]
          let currentOid = rootOid
          const parentsOidList: string[] = []
          let fileObjects: { prefix: string; oid: string; path: string; type: string; parent: string }[] = []
          for (let i = 0; i < paths.length; i++) {
            const newPrefix = paths
              .slice(0, i + 1)
              .filter(Boolean)
              .join('/')
            const nextPrefix = paths
              .slice(0, i + 2)
              .filter(Boolean)
              .join('/')

            const response = await getFilesFromOid(repo.id, currentOid, newPrefix)
            if (response) {
              const { objects } = response
              const fileObject = objects.find((fileObj) => fileObj.prefix === nextPrefix)

              if (fileObject) {
                if (currentOid !== fileObject.oid && i < paths.length - 1) {
                  parentsOidList.push(currentOid)
                }

                currentOid = fileObject?.oid
              }
              fileObjects = objects
            }
          }

          set((state) => {
            state.repoCoreState.git.rootOid = rootOid
            state.repoCoreState.git.currentOid = currentOid
            state.repoCoreState.git.fileObjects = fileObjects
            state.repoCoreState.git.parentsOidList = parentsOidList
            state.repoCoreState.git.status = 'SUCCESS'
          })
        } catch (error) {
          console.log(`Error: ${error}`)
          await get().repoCoreActions.loadFilesFromRepo()
        }
      }
    },
    git: {
      setCommits: (commits) => {
        set((state) => {
          state.repoCoreState.git.commits = commits
          state.repoCoreState.git.commitSourceBranch = state.branchState.currentBranch
        })
      },
      setCurrentOid: (oid) => {
        set((state) => {
          state.repoCoreState.git.currentOid = oid
        })
      },
      setRootOid: (oid) => {
        set((state) => {
          state.repoCoreState.git.rootOid = oid
        })
      },
      setIsCreateNewFile: (value: boolean) => {
        set((state) => {
          state.repoCoreState.git.isCreateNewFile = value
        })
      },
      readFilesFromOid: async (oid, prefix) => {
        const repo = get().repoCoreState.selectedRepo.repo
        const status = get().repoCoreState.selectedRepo.status

        if (status !== 'PENDING') {
          set((state) => {
            state.repoCoreState.git.status = 'PENDING'
          })
        }

        if (!repo) {
          set((state) => (state.repoCoreState.git.status = 'ERROR'))

          return
        }

        const { error, response } = await withAsync(() => getFilesFromOid(repo.id, oid, prefix))

        if (error) {
          set((state) => {
            state.repoCoreState.git.status = 'ERROR'
            state.repoCoreState.git.error = error
          })

          return
        }

        if (response) {
          const { objects } = response

          set((state) => {
            state.repoCoreState.git.fileObjects = objects
            state.repoCoreState.git.status = 'SUCCESS'
          })
        }
      },
      readFileContentFromOid: async (oid) => {
        const repo = get().repoCoreState.selectedRepo.repo

        if (!repo) {
          set((state) => (state.repoCoreState.git.status = 'ERROR'))

          return null
        }

        const { error, response } = await withAsync(() => getFileContentFromOid(repo.id, oid))

        if (error) {
          set((state) => {
            state.repoCoreState.git.status = 'ERROR'
            state.repoCoreState.git.error = error
          })

          return null
        }

        return response
      },
      downloadRepository: async () => {
        const repo = get().repoCoreState.selectedRepo.repo

        if (!repo) {
          set((state) => (state.repoCoreState.git.status = 'ERROR'))

          return null
        }

        const repoName = repo.name

        const { error } = await withAsync(() => saveRepository(repo.id, repoName))

        if (error) {
          set((state) => {
            state.repoCoreState.git.status = 'ERROR'
            state.repoCoreState.git.error = error
          })

          return null
        }
      },
      popParentOid: () => {
        const newParentsOidList = get().repoCoreState.git.parentsOidList || []
        const poppedOid = newParentsOidList.pop() || ''

        set((state) => {
          state.repoCoreState.git.parentsOidList = newParentsOidList
        })

        return poppedOid
      },
      pushParentOid: (oid) => {
        set((state) => {
          state.repoCoreState.git.parentsOidList.push(oid)
        })
      },
      getCurrentFolderPath: () => {
        const fileObject = get().repoCoreState.git.fileObjects?.[0]
        if (!fileObject) return ''
        return fileObject.prefix.split('/').slice(0, -1).join('/')
      },
      goBack: async () => {
        let currentOid = ''

        set((state) => {
          const poppedOid = state.repoCoreState.git.parentsOidList.pop()

          state.repoCoreState.git.currentOid = poppedOid || ''
          currentOid = poppedOid || ''
        })

        if (currentOid) {
          const fileObject = get().repoCoreState.git.fileObjects[0]
          const prefix = fileObject.prefix.split('/').slice(0, -2).join('/')
          await get().repoCoreActions.git.readFilesFromOid(currentOid, prefix)
        }
      }
    }
  }
})

export default createRepoCoreSlice
