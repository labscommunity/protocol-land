import { ContractResult, ContractState, RepositoryAction, User } from '../types'
import { isInvalidInput } from '../utils/isInvalidInput'

declare const ContractError

function isInvalidTimezone(timezone: any): boolean {
  return (
    isInvalidInput(timezone, 'object') ||
    isInvalidInput(timezone.value, 'string') ||
    isInvalidInput(timezone.label, 'string') ||
    isInvalidInput(timezone.offset, 'number') ||
    isInvalidInput(timezone.abbrev, 'string') ||
    isInvalidInput(timezone.altName, 'string')
  )
}

const allowedKeys = [
  'fullName',
  'userName',
  'avatar',
  'bio',
  'timezone',
  'location',
  'twitter',
  'email',
  'website',
  'readmeTxId'
]

export async function updateProfileDetails(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // Validate each property of the payload against its expected type
  if (
    isInvalidInput(payload, 'object') ||
    (payload.fullName !== undefined && isInvalidInput(payload.fullName, 'string', true)) ||
    (payload.userName !== undefined && isInvalidInput(payload.userName, 'string', true)) ||
    (payload.avatar !== undefined && isInvalidInput(payload.avatar, 'string', true)) ||
    (payload.bio !== undefined && isInvalidInput(payload.bio, 'string', true)) ||
    (payload.timezone !== undefined && isInvalidTimezone(payload.timezone)) ||
    (payload.location !== undefined && isInvalidInput(payload.location, 'string', true)) ||
    (payload.twitter !== undefined && isInvalidInput(payload.twitter, 'string', true)) ||
    (payload.email !== undefined && isInvalidInput(payload.email, 'string', true)) ||
    (payload.website !== undefined && isInvalidInput(payload.website, 'string', true)) ||
    (payload.readmeTxId !== undefined && isInvalidInput(payload.readmeTxId, 'arweave-address'))
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  // Filter the payload to only include allowed keys
  const filteredPayload = Object.fromEntries(Object.entries(payload).filter(([key]) => allowedKeys.includes(key)))

  if (Object.keys(filteredPayload).length === 0) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const user: User = state.users[caller] ?? {}

  state.users[caller] = { ...user, ...filteredPayload }

  return { state }
}

export async function getUserDetails(
  state: ContractState,
  { caller }: RepositoryAction
): Promise<ContractResult<User>> {
  const user = state.users[caller]

  if (!user) {
    return { result: {} }
  }

  return { result: user }
}
