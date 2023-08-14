import { ContractResult, RepositoryAction, RepositoryState } from '../types'

declare const ContractError

export async function initializeNewRepository(
  state: RepositoryState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult> {
  // validate payload
  if (!payload.title || !payload.description || !payload.owner) {
    throw new ContractError('Invalid inputs supplied.')
  }
  // validate if already initialized

  state.title = payload.title
  state.description = payload.description
  state.owner = caller
  state.repoTxId = payload.repoTxId

  return { state }
}
