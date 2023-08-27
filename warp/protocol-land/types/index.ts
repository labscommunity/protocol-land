export type ContractState = {
  users: Record<Address, User>
  repos: Repositories
  canEvolve: boolean
  evolve: null | any
  owner: Address
}

export type User = {
  fullName: string
  userName: string
  profilePicture: string
  bio: string
}

type Address = string

export type Repositories = Record<Address, Repo>

export type Repo = {
  id: string
  name: string
  description: string
  dataTxId: string
  owner: string
}

export type RepositoryAction = {
  input: RepositoryInput
  caller: Address
}

export type EvolveAction = {
  input: EvolveInput
  caller: Address
}

export type RepositoryInput = {
  function: RepositoryFunction
  payload: any
}

export type EvolveInput = {
  function: 'evolve'
  value: any
}

export type RepositoryFunction = 'initialize' | 'getRepository' | 'getRepositoriesByOwner' | 'updateRepositoryTxId' // more types will be added later

export type ContractResult<T> = { state: T } | { result: T }
