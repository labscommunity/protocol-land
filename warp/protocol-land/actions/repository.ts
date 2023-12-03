import { ContractResult, ContractState, Repo, RepositoryAction } from '../types'

declare const ContractError

export async function initializeNewRepository(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (!payload.name || !payload.description || !payload.dataTxId || !payload.id) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repoNameRegex = /^[a-zA-Z0-9._-]+$/
  if (!repoNameRegex.test(payload.name)) {
    throw new ContractError(
      'The repository name can only contain ASCII letters, digits, and the characters ., -, and _.'
    )
  }

  if (!state.userRepoIdMap) {
    state.userRepoIdMap = {}
  }

  const lowercasedRepoName = payload.name.toLowerCase()
  const callerRepos = state.userRepoIdMap[caller] || {}

  if (callerRepos[lowercasedRepoName]) {
    throw new ContractError('Repository with the same name already exists.')
  }

  const repo: Repo = {
    id: payload.id,
    name: payload.name,
    description: payload.description,
    defaultBranch: 'master',
    dataTxId: payload.dataTxId,
    owner: caller,
    contributors: [],
    pullRequests: [],
    issues: [],
    timestamp: Date.now(),
    fork: false,
    forks: [],
    forkedOwners: {},
    parent: null
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
  if (!payload.name || !payload.description || !payload.dataTxId || !payload.id || !payload.parent) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo: Repo = {
    id: payload.id,
    name: payload.name,
    description: payload.description,
    defaultBranch: 'master',
    dataTxId: payload.dataTxId,
    owner: caller,
    contributors: [],
    pullRequests: [],
    issues: [],
    timestamp: Date.now(),
    fork: true,
    forks: [],
    forkedOwners: {},
    parent: payload.parent
  }

  const parentRepo: Repo = state.repos[payload.parent]

  if (!parentRepo) {
    throw new ContractError('Fork failed. Parent not found.')
  }

  if (!parentRepo.forkedOwners) {
    parentRepo.forkedOwners = {}
  }

  if (parentRepo.forkedOwners[caller]) {
    throw new ContractError('Fork failed. Already forked by the owner.')
  }

  parentRepo.forks.push(payload.id)
  parentRepo.forkedOwners[caller] = true

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
