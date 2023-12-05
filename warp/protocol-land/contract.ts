import { evolveContract } from './actions/evolve'
import {
  addAssigneeToIssue,
  addCommentToIssue,
  createNewBounty,
  createNewIssue,
  updateBounty,
  updateIssueStatus
} from './actions/issues'
import { addReviewersToPR, approvePR, createNewPullRequest, updatePullRequestStatus } from './actions/pull-requests'
import {
  addContributor,
  forkRepository,
  getAllRepositoriesByContributor,
  getAllRepositoriesByOwner,
  getRepository,
  initializeNewRepository,
  isRepositoryNameAvailable,
  updateRepositoryDetails,
  updateRepositoryTxId
} from './actions/repository'
import { getUserDetails, updateProfileDetails } from './actions/user'
import { ContractState, EvolveAction, RepositoryAction } from './types'

declare const ContractError

export async function handle(state: ContractState, action: RepositoryAction | EvolveAction) {
  const input = action.input

  switch (input.function) {
    case 'initialize':
      return await initializeNewRepository(state, action as RepositoryAction)
    case 'forkRepository':
      return await forkRepository(state, action as RepositoryAction)
    case 'getRepository':
      return await getRepository(state, action as RepositoryAction)
    case 'getRepositoriesByOwner':
      return await getAllRepositoriesByOwner(state, action as RepositoryAction)
    case 'getRepositoriesByContributor':
      return await getAllRepositoriesByContributor(state, action as RepositoryAction)
    case 'updateRepositoryTxId':
      return await updateRepositoryTxId(state, action as RepositoryAction)
    case 'updateRepositoryDetails':
      return await updateRepositoryDetails(state, action as RepositoryAction)
    case 'isRepositoryNameAvailable':
      return await isRepositoryNameAvailable(state, action as RepositoryAction)
    case 'addContributor':
      return await addContributor(state, action as RepositoryAction)
    case 'createPullRequest':
      return await createNewPullRequest(state, action as RepositoryAction)
    case 'updatePullRequestStatus':
      return await updatePullRequestStatus(state, action as RepositoryAction)
    case 'addReviewersToPR':
      return await addReviewersToPR(state, action as RepositoryAction)
    case 'approvePR':
      return await approvePR(state, action as RepositoryAction)
    case 'createIssue':
      return await createNewIssue(state, action as RepositoryAction)
    case 'updateIssueStatus':
      return await updateIssueStatus(state, action as RepositoryAction)
    case 'addAssigneeToIssue':
      return await addAssigneeToIssue(state, action as RepositoryAction)
    case 'addCommentToIssue':
      return await addCommentToIssue(state, action as RepositoryAction)
    case 'createNewBounty':
      return await createNewBounty(state, action as RepositoryAction)
    case 'updateBounty':
      return await updateBounty(state, action as RepositoryAction)
    case 'updateProfileDetails':
      return await updateProfileDetails(state, action as RepositoryAction)
    case 'getUserDetails':
      return await getUserDetails(state, action as RepositoryAction)
    case 'evolve':
      return await evolveContract(state, action as EvolveAction)
    default:
      throw new ContractError(`No function supplied or function not recognised`)
  }
}
