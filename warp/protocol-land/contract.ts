import { evolveContract } from './actions/evolve'
import { getAllRepositoriesByOwner, getRepository, initializeNewRepository } from './actions/repository'
import { ContractState, EvolveAction, RepositoryAction } from './types'

declare const ContractError

export async function handle(state: ContractState, action: RepositoryAction | EvolveAction) {
  const input = action.input

  switch (input.function) {
    case 'initialize':
      return await initializeNewRepository(state, action as RepositoryAction)
    case 'getRepository':
      return await getRepository(state, action as RepositoryAction)
    case 'getRepositoriesByOwner':
      return await getAllRepositoriesByOwner(state, action as RepositoryAction)
    case 'evolve':
      return await evolveContract(state, action as EvolveAction)
    default:
      throw new ContractError(`No function supplied or function not recognised`)
  }
}
