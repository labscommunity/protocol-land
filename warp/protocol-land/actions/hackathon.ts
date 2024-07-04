import { ContractResult, ContractState, Hackathon, RepositoryAction } from '../types'
import { getBlockTimeStamp } from '../utils/getBlockTimeStamp'
import { isInvalidInput } from '../utils/isInvalidInput'

declare const ContractError

export async function createNewHackathon(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.title, 'string') ||
    isInvalidInput(payload.shortDescription, 'string') ||
    isInvalidInput(payload.descriptionTxId, 'string') ||
    isInvalidInput(payload.startsAt, 'number') ||
    isInvalidInput(payload.endsAt, 'number') ||
    isInvalidInput(payload.totalRewards, 'number') ||
    isInvalidInput(payload.totalRewardsBase, 'string') ||
    isInvalidInput(payload.location, 'string') ||
    isInvalidInput(payload.prizes, 'array') ||
    isInvalidInput(payload.hostedBy, 'string') ||
    isInvalidInput(payload.tags, 'array') ||
    isInvalidInput(payload.hostLogo, 'string') ||
    isInvalidInput(payload.hackathonLogo, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  if (!state.hackathons) {
    state.hackathons = {}
  }

  if (state.hackathons[payload.id]) {
    throw new ContractError('Hackathon already exists.')
  }

  const {
    id,
    title,
    shortDescription,
    descriptionTxId,
    startsAt,
    endsAt,
    totalRewards,
    totalRewardsBase,
    location,
    prizes,
    hostedBy,
    tags,
    hostLogo,
    hackathonLogo
  } = payload

  const hackathon: Hackathon = {
    id,
    title,
    shortDescription,
    descriptionTxId,
    startsAt,
    endsAt,
    totalRewards,
    totalRewardsBase,
    location,
    prizes,
    hostedBy,
    tags,
    hostLogo,
    hackathonLogo,
    timestamp: getBlockTimeStamp(),
    createdBy: caller,
    teams: {},
    participants: {},
    submissions: {}
  }

  state.hackathons[hackathon.id] = hackathon

  return { state }
}
