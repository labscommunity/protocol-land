import { evolveContract } from './actions/evolve'
import { initializeNewRepository } from './actions/initialize'
import { ContractResult, ContractState, EvolveAction, RepositoryAction } from './types'

declare const ContractError

export async function handle(state: ContractState, action: RepositoryAction | EvolveAction): Promise<ContractResult> {
  const input = action.input

  switch (input.function) {
    case 'initialize':
      return await initializeNewRepository(state, action as RepositoryAction)
    case 'evolve':
      return await evolveContract(state, action as EvolveAction)

    default:
      throw new ContractError(`No function supplied or function not recognised: "${input.function}"`)
  }
}
