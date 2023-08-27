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
    dataTxId: payload.dataTxId,
    owner: caller
  }

  state.repos[repo.id] = repo

  return { state }
}

export async function updateRepositoryTxId(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (!payload.dataTxId || !payload.id) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
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
