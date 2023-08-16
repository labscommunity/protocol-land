import { ContractResult, ContractState, Repo, RepositoryAction } from '../types'

declare const ContractError

export async function initializeNewRepository(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult> {
  // validate payload
  if (!payload.name || !payload.description || !payload.dataTxId || !payload.id) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo: Repo = {
    name: payload.name,
    description: payload.description,
    stars: 0,
    dataTxId: payload.dataTxId
  }

  const callerRepos = state.repos[caller]

  if (!callerRepos) {
    const reposMap = {}
    reposMap[repo.dataTxId] = repo

    state.repos[caller] = reposMap
  } else {
    state.repos[caller][repo.dataTxId] = repo
  }

  return { state }
}
