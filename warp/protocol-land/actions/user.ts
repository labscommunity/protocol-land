import { ContractResult, ContractState, RepositoryAction, User } from '../types'
import { isInvalidInput } from '../utils/isInvalidInput'
import { pickKeys } from '../utils/pickKeys'

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
    (payload.fullname !== undefined && isInvalidInput(payload.fullname, 'string', true)) ||
    (payload.username !== undefined && isInvalidInput(payload.username, 'username')) ||
    (payload.isUserNameArNS !== undefined && isInvalidInput(payload.isUserNameArNS, 'boolean')) ||
    (payload.avatar !== undefined && isInvalidInput(payload.avatar, 'arweave-address')) ||
    (payload.bio !== undefined && isInvalidInput(payload.bio, 'string', true)) ||
    (payload.timezone !== undefined && isInvalidTimezone(payload.timezone)) ||
    (payload.location !== undefined && isInvalidInput(payload.location, 'string', true)) ||
    (payload.twitter !== undefined && isInvalidInput(payload.twitter, 'string', true)) ||
    (payload.email !== undefined && isInvalidInput(payload.email, 'email', true)) ||
    (payload.website !== undefined && isInvalidInput(payload.website, 'url', true)) ||
    (payload.readmeTxId !== undefined && isInvalidInput(payload.readmeTxId, 'arweave-address'))
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  // Filter the payload to only include allowed keys
  const filteredPayload = pickKeys(payload, [
    'fullname',
    'username',
    'isUserNameArNS',
    'avatar',
    'bio',
    'timezone',
    'location',
    'twitter',
    'email',
    'website',
    'readmeTxId'
  ])

  if (Object.keys(filteredPayload).length === 0) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const user: User = state.users[caller] ?? {}

  if (payload.username !== undefined && user.username !== payload.username && !payload.isUserNameArNS) {
    const isUsernameTaken = Object.values(state.users).some(
      (userState) => userState.username && userState.username.toLowerCase() === payload.username.toLowerCase()
    )
    if (isUsernameTaken) {
      throw new ContractError(`Username ${payload.username} is not available`)
    }
  }

  state.users[caller] = { ...user, ...filteredPayload }

  return { state }
}

export async function isUsernameAvailable(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<boolean>> {
  if (isInvalidInput(payload, 'object') || isInvalidInput(payload.username, 'string')) {
    throw new ContractError('Username not supplied.')
  }

  if (isInvalidInput(payload.username, 'username')) {
    return { result: false }
  }

  const isUsernameTaken = Object.values(state.users).some(
    (userState) => userState.username && userState.username.toLowerCase() === payload.username.toLowerCase()
  )

  return { result: !isUsernameTaken }
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
