import { ContractResult, ContractState, ContributorInvite, Deployment, Repo, RepositoryAction } from '../types'
import { getBlockTimeStamp } from '../utils/getBlockTimeStamp'

declare const ContractError, SmartWeave

export async function initializeNewRepository(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (!payload.name || !payload.dataTxId || !payload.id) {
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

  const repo: Repo = {
    id: payload.id,
    name: payload.name,
    description: payload.description ?? '',
    defaultBranch: 'master',
    dataTxId: payload.dataTxId,
    owner: caller,
    contributors: [],
    pullRequests: [],
    deployments: [],
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
  if (!payload.name || !payload.dataTxId || !payload.id || !payload.parent) {
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

  const repo: Repo = {
    id: payload.id,
    name: payload.name,
    description: payload.description ?? '',
    defaultBranch: 'master',
    dataTxId: payload.dataTxId,
    owner: caller,
    contributors: [],
    pullRequests: [],
    issues: [],
    deployments: [],
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
  state.repos[repo.id] = repo

  return { state }
}

export async function updateRepositoryTxId(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (!payload.dataTxId || !payload.id) {
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

  return { state }
}

export async function getRepository(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<Repo>> {
  // validate payload
  if (!payload.id) {
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
): Promise<ContractResult<Repo[]>> {
  // validate payload
  if (!payload.owner) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repos = Object.values(state.repos)
  const ownerRepos = repos.filter((repo) => repo.owner === payload.owner)

  return { result: ownerRepos }
}

export async function getAllRepositoriesByContributor(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<Repo[]>> {
  // validate payload
  if (!payload.contributor) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repos = Object.values(state.repos)
  const contributorRepos = repos.filter((repo) =>
    repo?.contributors ? repo.contributors.indexOf(payload.contributor) > -1 : false
  )

  return { result: contributorRepos }
}

export async function updateRepositoryDetails(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (!payload.id) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  if (caller !== repo.owner) {
    throw new ContractError('Error: Only repo owner can update repo details.')
  }

  if (payload.name) {
    repo.name = payload.name
  }

  if (payload.description) {
    repo.description = payload.description
  }

  if (typeof payload.deploymentBranch === 'string') {
    repo.deploymentBranch = payload.deploymentBranch
  }

  return { state }
}

export async function addContributor(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (!payload.id || !payload.contributor) {
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
  if (!payload.id || !payload.deployment) {
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
    timestamp: SmartWeave.block.timestamp * 1000
  }

  repo.deployments.push(deployment)

  return { state }
}

export async function inviteContributor(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (!payload.id || !payload.contributor) {
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

  const invite = repo.contributorInvites.find((invite) => invite.address === payload.contributor)

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
  if (!payload.id) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const contributorInviteIdx = repo.contributorInvites.findIndex((invite) => invite.address === caller)

  if (contributorInviteIdx < 0) {
    throw new ContractError('Error: No invite was found to contribute.')
  }

  const contributorExists = repo.contributors.findIndex((address) => address === caller)

  if (contributorExists) {
    throw new ContractError('Contributor already exists.')
  }

  const invite = repo.contributorInvites[contributorInviteIdx]

  if (invite.status !== 'INVITED') {
    throw new ContractError('Contributor invite has been approved or rejected.')
  }

  repo.contributorInvites[contributorInviteIdx].status = 'ACCEPTED'
  repo.contributors.push(invite.address)

  return { state }
}

export async function rejectContributorInvite(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.id) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const contributorInviteIdx = repo.contributorInvites.findIndex((invite) => invite.address === caller)

  if (contributorInviteIdx < 0) {
    throw new ContractError('Error: No invite was found to contribute.')
  }

  const contributorExists = repo.contributors.findIndex((address) => address === caller)

  if (contributorExists) {
    throw new ContractError('Contributor already exists.')
  }

  const invite = repo.contributorInvites[contributorInviteIdx]

  if (invite.status !== 'INVITED') {
    throw new ContractError('Contributor invite has been approved or rejected.')
  }

  repo.contributorInvites[contributorInviteIdx].status = 'REJECTED'

  return { state }
}

export async function isRepositoryNameAvailable(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<boolean>> {
  if (!payload.name) {
    throw new ContractError('Repository name not supplied.')
  }

  const userRepos = state.userRepoIdMap[caller] ?? {}
  const repoName = payload.name.trim().toLowerCase()

  const isAvailable = !userRepos[repoName]

  return { result: isAvailable }
}
