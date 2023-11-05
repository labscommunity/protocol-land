export type ContractState = {
  users: Record<Address, User>
  repos: Repositories
  canEvolve: boolean
  evolve: null | any
  owner: Address
}

export type User = {
  fullName?: string
  userName?: string
  avatar?: string
  bio?: string
  timezone?: Timezone
  location?: string
  twitter?: string
  email?: string
  website?: string
  readmeTxId?: string
}

export type Timezone = {
  value: string
  label: string
  offset: number
  abbrev: string
  altName: string
}

type Address = string

export type Repositories = Record<Address, Repo>

export type Repo = {
  id: string
  name: string
  description: string
  defaultBranch: string
  dataTxId: string
  owner: string
  pullRequests: PullRequest[]
  issues: Issue[]
  contributors: string[]
  timestamp: number
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

export type Issue = {
  id: number
  repoId: string
  title: string
  description: string
  author: string
  status: IssueStatus
  timestamp: number
  assignees: string[]
  comments: Comment[]
  bounties: Bounty[]
}

export type Bounty = {
  id: number
  amount: number
  expiry: number
  status: BountyStatus
  paymentTxId: string | null
  timestamp: number
}

export type Comment = {
  author: string
  timestamp: number
  description: string
}

export type Reviewer = {
  address: string
  approved: boolean
}

export type PullRequestStatus = 'OPEN' | 'CLOSED' | 'MERGED'

export type IssueStatus = 'OPEN' | 'CLOSED' | 'COMPLETED'

export type BountyStatus = 'ACTIVE' | 'CLAIMED' | 'EXPIRED' | 'CLOSED'

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
  'getRepositoriesByContributor',
  'updateRepositoryTxId',
  'createPullRequest',
  'updatePullRequestStatus',
  'updateRepositoryDetails',
  'addContributor',
  'addReviewersToPR',
  'approvePR',
  'createIssue',
  'updateIssueStatus',
  'addAssigneeToIssue',
  'addCommentToIssue',
  'createNewBounty',
  'updateBounty',
  'updateProfileDetails',
  'getUserDetails'
] as const

export type RepositoryFunction = (typeof repoFnList)[number] // more types will be added later

export type ContractResult<T> = { state: T } | { result: T }
