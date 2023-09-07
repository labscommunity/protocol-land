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
  pullRequests: PullRequest[]
  contributors: string[]
}

export type PullRequest = {
  id: number
  repoId: string
  title: string
  description: string
  baseBranchOid: string
  baseBranch: string
  compareBranch: string
  author: string
  status: PullRequestStatus
  reviewers: Reviewer[]
  timestamp: number
}

export type Reviewer = {
  address: string
  approved: boolean
}

export type PullRequestStatus = 'OPEN' | 'CLOSED' | 'MERGED'

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

const repoFnList = [
  'initialize',
  'getRepository',
  'getRepositoriesByOwner',
  'updateRepositoryTxId',
  'createPullRequest',
  'updatePullRequestStatus',
  'updateRepositoryDetails',
  'addContributor',
  'addReviewersToPR',
  'approvePR'
] as const

export type RepositoryFunction = (typeof repoFnList)[number] // more types will be added later

export type ContractResult<T> = { state: T } | { result: T }
