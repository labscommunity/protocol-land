import { evolveContract } from './actions/evolve'
import { addReviewersToPR, createNewPullRequest, updatePullRequestStatus } from './actions/pull-requests'
import {
  addContributor,
  getAllRepositoriesByOwner,
  getRepository,
  initializeNewRepository,
  updateRepositoryDetails,
  updateRepositoryTxId
} from './actions/repository'
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
    case 'updateRepositoryTxId':
      return await updateRepositoryTxId(state, action as RepositoryAction)
    case 'updateRepositoryDetails':
      return await updateRepositoryDetails(state, action as RepositoryAction)
    case 'addContributor':
      return await addContributor(state, action as RepositoryAction)
    case 'createPullRequest':
      return await createNewPullRequest(state, action as RepositoryAction)
    case 'updatePullRequestStatus':
      return await updatePullRequestStatus(state, action as RepositoryAction)
    case 'addReviewersToPR':
      return await addReviewersToPR(state, action as RepositoryAction)
    case 'evolve':
      return await evolveContract(state, action as EvolveAction)
    default:
      throw new ContractError(`No function supplied or function not recognised`)
  }
}
