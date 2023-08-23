import { ContractResult, ContractState, RepositoryAction } from '../types'

declare const ContractError

export async function createNewBranch(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (!payload.newDataTxId || !payload.totalBranchCount || !payload.id) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.id]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  repo.branches = payload.totalBranchCount
  repo.dataTxId = payload.newDataTxId

  return { state }
}
