import { ContractResult, ContractState, RepositoryAction, User } from '../types'

declare const ContractError

export async function updateProfileDetails(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
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
