import { User } from './user'

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
}

export type PullRequest = {
  id: number
  repoId: string
  title: string
  description: string
  baseBranch: string
  compareBranch: string
  baseBranchOid: string
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

export type MergeResult = {
  oid?: string // The SHA-1 object id that is now at the head of the branch. Absent only if `dryRun` was specified and `mergeCommit` is true.
  alreadyMerged?: boolean // True if the branch was already merged so no changes were made
  fastForward?: boolean // True if it was a fast-forward merge
  mergeCommit?: boolean // True if merge resulted in a merge commit
  tree?: string // The SHA-1 object id of the tree resulting from a merge commit
}

export type Reviewer = {
  address: string
  approved: boolean
}

export type PullRequestStatus = 'OPEN' | 'CLOSED' | 'MERGED'

export type IssueStatus = 'OPEN' | 'CLOSED' | 'COMPLETED'

export type BountyStatus = 'ACTIVE' | 'CLAIMED' | 'EXPIRED' | 'CLOSED'

export type WarpReadState = {
  cachedValue: {
    state: ContractState
  }
}

export type ContractState = {
  users: Record<string, User>
  repos: Repositories
  canEvolve: boolean
  evolve: null | any
  owner: string
}

export type Repositories = Record<string, Repo>
