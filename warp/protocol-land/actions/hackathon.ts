import { ContractResult, ContractState, Hackathon, RepositoryAction, Team } from '../types'
import { getBlockTimeStamp } from '../utils/getBlockTimeStamp'
import { isInvalidInput } from '../utils/isInvalidInput'
import { pickKeys } from '../utils/pickKeys'

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

export async function updateHackathon(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    (payload.title !== undefined && isInvalidInput(payload.title, 'string')) ||
    (payload.shortDescription !== undefined && isInvalidInput(payload.shortDescription, 'string')) ||
    (payload.descriptionTxId !== undefined && isInvalidInput(payload.descriptionTxId, 'string')) ||
    (payload.startsAt !== undefined && isInvalidInput(payload.startsAt, 'number')) ||
    (payload.endsAt !== undefined && isInvalidInput(payload.endsAt, 'number')) ||
    (payload.totalRewards !== undefined && isInvalidInput(payload.totalRewards, 'number')) ||
    (payload.totalRewardsBase !== undefined && isInvalidInput(payload.totalRewardsBase, 'string')) ||
    (payload.location !== undefined && isInvalidInput(payload.location, 'string')) ||
    (payload.prizes !== undefined && isInvalidInput(payload.prizes, 'array')) ||
    (payload.hostedBy !== undefined && isInvalidInput(payload.hostedBy, 'string')) ||
    (payload.tags !== undefined && isInvalidInput(payload.tags, 'array')) ||
    (payload.hostLogo !== undefined && isInvalidInput(payload.hostLogo, 'string')) ||
    (payload.hackathonLogo !== undefined && isInvalidInput(payload.hackathonLogo, 'string'))
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const hackathon = state.hackathons[payload.id]
  if (!hackathon) {
    throw new ContractError('Hackathon doesnt exists.')
  }

  if (hackathon.createdBy !== caller) {
    throw new ContractError('Only owner of hackathon can edit it.')
  }

  const currentTimeStamp = getBlockTimeStamp()
  if (hackathon.startsAt * 1000 < currentTimeStamp) {
    throw new ContractError('Hackathon has started already. Cannot edit.')
  }

  // Filter the payload to only include allowed keys
  const filteredPayload = pickKeys(payload, [
    'title',
    'shortDescription',
    'descriptionTxId',
    'startsAt',
    'endsAt',
    'totalRewards',
    'totalRewardsBase',
    'location',
    'prizes',
    'hostedBy',
    'tags',
    'hostLogo',
    'hackathonLogo'
  ])

  if (Object.keys(filteredPayload).length === 0) {
    throw new ContractError('Invalid inputs supplied.')
  }

  state.hackathons[payload.id] = { ...hackathon, ...filteredPayload }

  return { state }
}

export async function participateInHackathon(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    (payload.teamId !== undefined && isInvalidInput(payload.teamId))
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

  if (participant) {
    throw new ContractError('Already participated. Cannot reparticipate')
  }

  hackathon.participants[caller] = {
    address: caller,
    timestamp: currentTimeStamp,
    teamId: payload.teamId
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

export async function createHackathonTeam(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.hackathonId, 'uuid') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.name, 'string') ||
    isInvalidInput(payload.members, 'array')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const hackathon = state.hackathons[payload.hackathonId]
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

  const team = hackathon.teams[payload.id]
  if (team) {
    throw new ContractError('Team already exists.')
  }

  const newTeam: Team = {
    id: payload.id,
    members: payload.members,
    name: payload.name,
    owner: caller,
    timestamp: currentTimeStamp
  }

  hackathon.teams[payload.id] = newTeam

  return { state }
}

export async function updateHackathonTeam(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.id, 'uuid') ||
    isInvalidInput(payload.hackathonId, 'uuid') ||
    (payload.name !== undefined && isInvalidInput(payload.name, 'string')) ||
    (payload.members !== undefined && isInvalidInput(payload.name, 'array'))
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const hackathon = state.hackathons[payload.hackathonId]
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

  const team = hackathon.teams[payload.id]
  if (!team) {
    throw new ContractError('Team doesnt exists.')
  }

  if (caller !== team.owner) {
    throw new ContractError('Only team owner can edit the team details.')
  }

  if (payload.name) {
    team.name = payload.name
  }

  if (payload.members) {
    team.members = payload.members
  }

  return { state }
}
