import { ContractResult, ContractState, Repo, RepositoryAction } from '../types'

declare const ContractError

export async function createNewPullRequest(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (!payload.title || !payload.description || !payload.owner || !payload.baseBranch || !payload.targetBranch) {
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
