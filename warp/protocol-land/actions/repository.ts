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
    timestamp: Date.now()
  }

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
