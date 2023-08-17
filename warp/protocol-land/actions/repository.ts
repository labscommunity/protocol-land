import { ContractResult, ContractState, Repo, RepositoryAction } from '../types'

declare const ContractError

export async function initializeNewRepository(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (!payload.name || !payload.description || !payload.dataTxId) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo: Repo = {
    name: payload.name,
    description: payload.description,
    stars: 0,
    dataTxId: payload.dataTxId,
    owner: caller
  }

  state.repos[repo.dataTxId] = repo

  return { state }
}

export async function getRepository(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<Repo>> {
  // validate payload
  if (!payload.txId) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.txId]

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
