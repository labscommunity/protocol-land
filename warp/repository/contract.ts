import { initializeNewRepository } from './actions/initialize'
import { ContractResult, RepositoryAction, RepositoryState } from './types'

declare const ContractError

export async function handle(state: RepositoryState, action: RepositoryAction): Promise<ContractResult> {
  const input = action.input

  switch (input.function) {
    case 'initialize':
      return await initializeNewRepository(state, action)

    default:
      throw new ContractError(`No function supplied or function not recognised: "${input.function}"`)
  }
}
