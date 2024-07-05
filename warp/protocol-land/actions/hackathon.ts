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
    isInvalidInput(payload.prizes, 'object') ||
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

export async function participateInHackathon(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (isInvalidInput(payload, 'object') || isInvalidInput(payload.id, 'uuid')) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const hackathon = state.hackathons[payload.id]
  if (!hackathon) {
    throw new ContractError('Hackathon doesnt exists.')
  }

  const currentTimeStamp = getBlockTimeStamp()
  if (hackathon.startsAt * 1000 > currentTimeStamp) {
    throw new ContractError('Hackathon has not yet started.')
  }

  if (hackathon.endsAt * 1000 <= currentTimeStamp) {
    throw new ContractError('Hackathon has ended.')
  }

  const participant = hackathon.participants[caller]

  if (participant) {
    throw new ContractError('Already participated. Cannot reparticipate')
  }

  hackathon.participants[caller] = {
    address: caller,
    timestamp: currentTimeStamp
  }

  return { state }
}

export async function postSubmissionInHackathon(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.logo, 'string') ||
    isInvalidInput(payload.projectName, 'string') ||
    isInvalidInput(payload.shortDescription, 'string') ||
    isInvalidInput(payload.descriptionTxId, 'string') ||
    isInvalidInput(payload.technologiesUsed, 'string') ||
    isInvalidInput(payload.images, 'array') ||
    isInvalidInput(payload.links, 'array')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const hackathon = state.hackathons[payload.id]
  if (!hackathon) {
    throw new ContractError('Hackathon doesnt exists.')
  }

  const currentTimeStamp = getBlockTimeStamp()
  if (hackathon.startsAt * 1000 > currentTimeStamp) {
    throw new ContractError('Hackathon has not yet started.')
  }

  if (hackathon.endsAt * 1000 <= currentTimeStamp) {
    throw new ContractError('Hackathon has ended.')
  }

  const participant = hackathon.participants[caller]

  if (!participant) {
    throw new ContractError('You need to participate before making a submission.')
  }

  hackathon.submissions[caller] = {
    logo: payload.logo,
    projectName: payload.projectName,
    shortDescription: payload.shortDescription,
    descriptionTxId: payload.descriptionTxId,
    technologiesUsed: payload.technologiesUsed,
    submittedBy: caller,
    images: payload.images || [],
    links: payload.links,
    video: payload.video || '',
    timestamp: currentTimeStamp,
    isWinner: false,
    prizeIds: []
  }

  return { state }
}

export async function postJudgementInHackathon(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.prizeId, 'uuid') ||
    isInvalidInput(payload.participantAddress, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const hackathon = state.hackathons[payload.id]
  if (!hackathon) {
    throw new ContractError('Hackathon doesnt exists.')
  }

  if (hackathon.createdBy !== caller) {
    throw new ContractError('Only Hackathon owner can judge.')
  }

  const currentTimeStamp = getBlockTimeStamp()
  if (hackathon.startsAt * 1000 > currentTimeStamp) {
    throw new ContractError('Hackathon has not yet started.')
  }

  if (hackathon.endsAt * 1000 >= currentTimeStamp) {
    throw new ContractError('Hackathon is still running.')
  }

  const participant = hackathon.participants[payload.participantAddress]

  if (!participant) {
    throw new ContractError('Participant not found.')
  }

  const submission = hackathon.submissions[payload.participantAddress]

  if (!submission) {
    throw new ContractError('Submission not found.')
  }

  const prize = hackathon.prizes[payload.prizeId]

  if (!prize) {
    throw new ContractError('Submission not found.')
  }

  const maxCountForAwardingPrize = prize.winningParticipantsCount

  let currentAwardedCount = 0

  for (const submittedBy in hackathon.submissions) {
    const submission = hackathon.submissions[submittedBy]
    const hasSamePrize = submission.prizeIds.includes(payload.prizeId)
    if (submission.isWinner && hasSamePrize) {
      currentAwardedCount += 1
    }
  }

  if (currentAwardedCount >= maxCountForAwardingPrize) {
    throw new ContractError('Cannot award this prize anymore. Limit reached.')
  }

  submission.isWinner = true
  submission.prizeIds.push(prize.id)

  return { state }
}
