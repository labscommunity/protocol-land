import { ContractResult, ContractState, ContributorInvite, EvolveAction, Repo } from '../types'
import { getBlockTimeStamp } from '../utils/getBlockTimeStamp'

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

export async function postEvolve(
  state: ContractState,
  { caller }: EvolveAction
): Promise<ContractResult<ContractState>> {
  // validate owner
  if (state.owner !== caller) {
    throw new ContractError('Only the owner can evolve a contract.')
  }

  if (state.stateEvolve1) return { state }

  for (const repoId in state.repos) {
    const repo = state.repos[repoId]

    if (!repo.contributorInvites) {
      repo.contributorInvites = []
    } else {
      repo.contributors.forEach((contributor) => {
        const inviteExists = repo.contributorInvites.find((invite) => invite.address === contributor)

        if (!inviteExists) {
          const invite: ContributorInvite = {
            address: contributor,
            timestamp: getBlockTimeStamp(),
            status: 'ACCEPTED'
          }

          repo.contributorInvites.push(invite)
        }
      })
    }
  }

  state.stateEvolve1 = true

  return { state }
}
