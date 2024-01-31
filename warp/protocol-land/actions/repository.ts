import {
  ContractResult,
  ContractState,
  ContributorInvite,
  Deployment,
  Domain,
  Repo,
  RepositoryAction,
  RepoWithParent
} from '../types'
import { getBlockTimeStamp } from '../utils/getBlockTimeStamp'
import { isInvalidInput } from '../utils/isInvalidInput'

declare const ContractError

export async function initializeNewRepository(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.name, 'string') ||
    isInvalidInput(payload.dataTxId, 'arweave-address') ||
    isInvalidInput(payload.id, 'uuid')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  if (state.repos[payload.id]) {
    throw new ContractError('Repository already exists.')
  }

  const repoNameRegex = /^[a-zA-Z0-9._-]+$/
  if (!repoNameRegex.test(payload.name)) {
    throw new ContractError(
      'The repository name can only contain ASCII letters, digits, and the characters ., -, and _.'
    )
  }

  const lowercasedRepoName = payload.name.toLowerCase()
  const callerRepos = state.userRepoIdMap[caller] ?? {}

  if (callerRepos[lowercasedRepoName]) {
    throw new ContractError('Repository with the same name already exists.')
  }

  const description = isInvalidInput(payload.description, 'string', true) ? '' : payload.description

  const repo: Repo = {
    id: payload.id,
    name: payload.name,
    description,
    defaultBranch: 'master',
    dataTxId: payload.dataTxId,
    uploadStrategy: payload.uploadStrategy === 'ARSEEDING' ? 'ARSEEDING' : 'DEFAULT',
    owner: caller,
    contributors: [],
    pullRequests: [],
    deployments: [],
    domains: [],
    issues: [],
    deploymentBranch: '',
    timestamp: getBlockTimeStamp(),
    fork: false,
    forks: {},
    parent: null,
    private: false,
    contributorInvites: []
  }

  if (payload.visibility === 'private') {
    repo.private = true
    repo.privateStateTxId = payload.privateStateTxId
  }

  state.repos[repo.id] = repo
  callerRepos[lowercasedRepoName] = repo.id
  state.userRepoIdMap[caller] = callerRepos

  return { state }
}

export async function forkRepository(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.name, 'string') ||
    isInvalidInput(payload.dataTxId, 'arweave-address') ||
    isInvalidInput(payload.parent, 'uuid') ||
    isInvalidInput(payload.id, 'uuid')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  if (state.repos[payload.id]) {
    throw new ContractError('Repository already exists.')
  }

  const repoNameRegex = /^[a-zA-Z0-9._-]+$/
  if (!repoNameRegex.test(payload.name)) {
    throw new ContractError(
      'The repository name can only contain ASCII letters, digits, and the characters ., -, and _.'
    )
  }

  const lowercasedRepoName = payload.name.toLowerCase()
  const callerRepos = state.userRepoIdMap[caller] ?? {}

  if (callerRepos[lowercasedRepoName]) {
    throw new ContractError('Repository with the same name already exists.')
  }

  const description = isInvalidInput(payload.description, 'string', true) ? '' : payload.description

  const repo: Repo = {
    id: payload.id,
    name: payload.name,
    description,
    defaultBranch: 'master',
    dataTxId: payload.dataTxId,
    uploadStrategy: 'DEFAULT',
    owner: caller,
    contributors: [],
    pullRequests: [],
    issues: [],
    deployments: [],
    domains: [],
    deploymentBranch: '',
    timestamp: getBlockTimeStamp(),
    fork: true,
    forks: {},
    parent: payload.parent,
    private: false,
    contributorInvites: []
  }

  const parentRepo: Repo = state.repos[payload.parent]

  if (!parentRepo) {
    throw new ContractError('Fork failed. Parent not found.')
  }

  if (parentRepo.forks[caller]) {
    throw new ContractError('Fork failed. Already forked by the caller.')
  }

  parentRepo.forks[caller] = { id: repo.id, name: repo.name, owner: repo.owner, timestamp: repo.timestamp }
  repo.uploadStrategy = parentRepo.uploadStrategy
  state.repos[repo.id] = repo

  return { state }
}

export async function updateRepositoryTxId(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.dataTxId, 'arweave-address') ||
    isInvalidInput(payload.id, 'uuid')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  repo.dataTxId = payload.dataTxId
  repo.uploadStrategy = payload.uploadStrategy === 'ARSEEDING' ? 'ARSEEDING' : 'DEFAULT'

  return { state }
}

export async function getRepository(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<Repo>> {
  // validate payloads
  if (isInvalidInput(payload, 'object') || isInvalidInput(payload.id, 'uuid')) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  return { result: repo }
}

export async function getAllRepositoriesByOwner(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<RepoWithParent[]>> {
  // validate payload
  if (isInvalidInput(payload, 'object') || isInvalidInput(payload.owner, 'arweave-address')) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repos = Object.values(state.repos) as RepoWithParent[]
  const ownerRepos = repos
    .filter((repo) => repo.owner === payload.owner)
    .map((repo) => {
      if (repo.parent) {
        const parentRepo = state.repos[repo.parent]
        repo.parentRepo = {
          id: parentRepo.id,
          name: parentRepo.name,
          owner: parentRepo.owner
        }
      }
      return repo
    })

  return { result: ownerRepos }
}

export async function getAllRepositoriesByContributor(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<RepoWithParent[]>> {
  // validate payload
  if (isInvalidInput(payload, 'object') || isInvalidInput(payload.contributor, 'arweave-address')) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repos = Object.values(state.repos) as RepoWithParent[]
  const contributorRepos = repos
    .filter((repo) => (repo?.contributors ? repo.contributors.indexOf(payload.contributor) > -1 : false))
    .map((repo) => {
      if (repo.parent) {
        const parentRepo = state.repos[repo.parent]
        repo.parentRepo = {
          id: parentRepo.id,
          name: parentRepo.name,
          owner: parentRepo.owner
        }
      }
      return repo
    })

  return { result: contributorRepos }
}

export async function updateRepositoryDetails(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (isInvalidInput(payload, 'object') || isInvalidInput(payload.id, 'uuid')) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const isNameInvalid = isInvalidInput(payload.name, 'string')
  const isDescriptionInvalid = isInvalidInput(payload.description, 'string', true)
  const isDeploymentBranchInvalid = isInvalidInput(payload.deploymentBranch, 'string', true)

  if (isNameInvalid && isDescriptionInvalid && isDeploymentBranchInvalid) {
    throw new ContractError('Either name, description or deploymentBranch should be present.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const isOwner = caller === repo.owner
  const isContributor = repo.contributors.indexOf(caller) > -1

  if (!isOwner && (!isNameInvalid || !isDescriptionInvalid)) {
    throw new ContractError('Error: Only repo owner can update repo name and description.')
  }

  if (!(isOwner || isContributor) && !isDeploymentBranchInvalid) {
    throw new ContractError('Error: Only repo owner or contributor can update deployment branch.')
  }

  if (!isNameInvalid) {
    const newName = payload.name
    if (!/^[a-zA-Z0-9._-]+$/.test(newName)) {
      throw new ContractError(
        'The repository name can only contain ASCII letters, digits, and the characters ., -, and _.'
      )
    }

    const newNameLowercased = newName.toLowerCase()
    const callerRepos = state.userRepoIdMap[caller]

    if (callerRepos[newNameLowercased]) {
      throw new ContractError('Repository with the same name already exists.')
    }

    delete callerRepos[repo.name.toLowerCase()]
    repo.name = newName
    callerRepos[newNameLowercased] = repo.id
  }

  if (!isDescriptionInvalid) {
    repo.description = payload.description
  }

  if (!isDeploymentBranchInvalid) {
    repo.deploymentBranch = payload.deploymentBranch
  }

  return { state }
}

export async function addContributor(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.contributor, 'arweave-address') ||
    isInvalidInput(payload.id, 'uuid')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  if (caller !== repo.owner) {
    throw new ContractError('Error: Only repo owner can update repo details.')
  }

  const contributorExists = repo.contributors.find((address) => address === payload.contributor)

  if (contributorExists) {
    throw new ContractError('Contributor already exists.')
  }

  repo.contributors.push(payload.contributor)

  return { state }
}

export async function addDeployment(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.deployment, 'object') ||
    isInvalidInput(payload.deployment.txId, 'arweave-address') ||
    isInvalidInput(payload.deployment.commitOid, 'string') ||
    isInvalidInput(payload.deployment.commitMessage, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  if (!repo.deploymentBranch) {
    throw new ContractError('Deployment branch is not selected')
  }

  const deployment: Deployment = {
    txId: payload.deployment.txId,
    branch: repo.deploymentBranch,
    deployedBy: caller,
    commitOid: payload.deployment.commitOid,
    commitMessage: payload.deployment.commitMessage,
    timestamp: getBlockTimeStamp()
  }

  repo.deployments.push(deployment)

  return { state }
}

export async function addDomain(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.domain, 'object') ||
    isInvalidInput(payload.domain.txId, 'arweave-address') ||
    isInvalidInput(payload.domain.contractTxId, 'arweave-address') ||
    isInvalidInput(payload.domain.name, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  if (!repo.domains && !Array.isArray(repo.domains)) {
    repo.domains = []
  }

  const domain: Domain = {
    txId: payload.domain.txId,
    name: payload.domain.name,
    contractTxId: payload.domain.contractTxId,
    controller: caller,
    timestamp: getBlockTimeStamp()
  }

  repo.domains.push(domain)

  return { state }
}

export async function updateDomain(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.domain, 'object') ||
    isInvalidInput(payload.domain.txId, 'arweave-address') ||
    (isInvalidInput(payload.domain.name, 'string') && isInvalidInput(payload.domain.contractTxId, 'arweave-address'))
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  const domain = repo.domains.find(
    (d) => d.name === payload.domain.name || d.contractTxId === payload.domain.contractTxId
  )

  if (!domain) {
    throw new ContractError('Error: Domain not found')
  }

  if (payload.domain.txId) {
    domain.txId = payload.domain.txId
    domain.timestamp = getBlockTimeStamp()
  }

  return { state }
}

export async function inviteContributor(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.contributor, 'arweave-address')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  if (caller !== repo.owner) {
    throw new ContractError('Error: Only repo owner can update repo details.')
  }

  const contributorExists = repo.contributors.find((address) => address === payload.contributor)

  if (contributorExists) {
    throw new ContractError('Contributor already exists.')
  }

  const invite = repo.contributorInvites.find(
    (invite) => invite.address === payload.contributor && invite.status === 'INVITED'
  )

  if (invite) {
    throw new ContractError('Error: Invite already exists.')
  }

  const contributorInvite: ContributorInvite = {
    address: payload.contributor,
    timestamp: getBlockTimeStamp(),
    status: 'INVITED'
  }

  repo.contributorInvites.push(contributorInvite)

  return { state }
}

export async function acceptContributorInvite(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.visibility, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const contributorInviteIdx = repo.contributorInvites.findIndex(
    (invite) => invite.address === caller && invite.status === 'INVITED'
  )

  if (contributorInviteIdx < 0) {
    throw new ContractError('Error: No invite was found to contribute.')
  }

  const contributorExists = repo.contributors.findIndex((address) => address === caller)

  if (contributorExists > -1) {
    throw new ContractError('Contributor already exists.')
  }

  const invite = repo.contributorInvites[contributorInviteIdx]

  if (invite.status !== 'INVITED') {
    throw new ContractError('Contributor invite has been approved or rejected.')
  }

  repo.contributorInvites[contributorInviteIdx].status = 'ACCEPTED'

  if (payload.visibility === 'private' && payload.privateStateTxId) {
    repo.privateStateTxId = payload.privateStateTxId

    return { state }
  }

  repo.contributors.push(invite.address)

  return { state }
}

export async function rejectContributorInvite(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (isInvalidInput(payload, 'object') || isInvalidInput(payload.id, 'uuid')) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const contributorInviteIdx = repo.contributorInvites.findIndex(
    (invite) => invite.address === caller && invite.status === 'INVITED'
  )

  if (contributorInviteIdx < 0) {
    throw new ContractError('Error: No invite was found to reject.')
  }

  const contributorExists = repo.contributors.findIndex((address) => address === caller)

  if (contributorExists > -1) {
    throw new ContractError('Contributor already exists.')
  }

  const invite = repo.contributorInvites[contributorInviteIdx]

  if (invite.status !== 'INVITED') {
    throw new ContractError('Contributor invite has been approved or rejected.')
  }

  repo.contributorInvites[contributorInviteIdx].status = 'REJECTED'

  return { state }
}

export async function cancelContributorInvite(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.contributor, 'arweave-address')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  if (caller !== repo.owner) {
    throw new ContractError('Error: Only repo owner can cancel invites.')
  }

  const targetInvite = repo.contributorInvites.find(
    (invite) => invite.address === payload.contributor && invite.status === 'INVITED'
  )

  if (!targetInvite) {
    throw new ContractError('Error: No invite was found to cancel.')
  }

  const filteredInvites = repo.contributorInvites.filter((invite) => {
    if (invite.address === payload.contributor && invite.status === 'INVITED') {
      return false
    }

    return true
  })

  repo.contributorInvites = filteredInvites

  return { state }
}

export async function updatePrivateStateTx(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.privateStateTxId, 'arweave-address')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const hasPermissions = caller === repo.owner

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  repo.privateStateTxId = payload.privateStateTxId

  return { state }
}

export async function isRepositoryNameAvailable(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<boolean>> {
  if (isInvalidInput(payload, 'object') || isInvalidInput(payload.name, 'string')) {
    throw new ContractError('Repository name not supplied.')
  }

  const userRepos = state.userRepoIdMap[caller] ?? {}
  const repoName = payload.name.trim().toLowerCase()

  const isAvailable = !userRepos[repoName]

  return { result: isAvailable }
}
