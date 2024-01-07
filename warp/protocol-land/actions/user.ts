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

export async function updateProfileDetails(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // Validate each property of the payload against its expected type
  if (
    isInvalidInput(payload, 'object') ||
    (payload.fullName !== undefined && isInvalidInput(payload.fullName, 'string')) ||
    (payload.userName !== undefined && isInvalidInput(payload.userName, 'string')) ||
    (payload.avatar !== undefined && isInvalidInput(payload.avatar, 'string')) ||
    (payload.bio !== undefined && isInvalidInput(payload.bio, 'string')) ||
    (payload.timezone !== undefined && isInvalidTimezone(payload.timezone)) ||
    (payload.location !== undefined && isInvalidInput(payload.location, 'string')) ||
    (payload.twitter !== undefined && isInvalidInput(payload.twitter, 'string')) ||
    (payload.email !== undefined && isInvalidInput(payload.email, 'string')) ||
    (payload.website !== undefined && isInvalidInput(payload.website, 'string')) ||
    (payload.readmeTxId !== undefined && isInvalidInput(payload.readmeTxId, 'arweave-address'))
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  if (Object.keys(payload).length === 0) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const user: User = state.users[caller] ?? {}

  state.users[caller] = { ...user, ...payload }

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
