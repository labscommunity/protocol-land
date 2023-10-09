import { ContractResult, ContractState, EvolveAction, Repo } from '../types'

declare const ContractError

export async function evolveContract(
  state: ContractState,
  { caller, input: { value } }: EvolveAction
): Promise<ContractResult<ContractState>> {
  // validate owner
  if (state.owner !== caller) {
    throw new ContractError('Only the owner can evolve a contract.')
  }

  state.evolve = value

  return { state }
}

export function evolveRepoState(repoObj: Repo) {
  const defaultRepo = {
    description: '',
    defaultBranch: 'master',
    pullRequests: [],
    issues: [],
    contributors: []
  }

  return { ...defaultRepo, ...repoObj }
}
