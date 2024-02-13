export type ContractState = {
  users: Record<Address, User>
  repos: Repositories
  userRepoIdMap: Record<Address, Record<string, string>>
  canEvolve: boolean
  evolve: null | any
  owner: Address
}

export type User = {
  fullname?: string
  username?: string
  isUserNameArNS?: boolean
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
  uploadStrategy: 'DEFAULT' | 'ARSEEDING'
  owner: string
  pullRequests: PullRequest[]
  issues: Issue[]
  contributors: string[]
  deployments: Deployment[]
  domains: Domain[]
  deploymentBranch: string
  timestamp: number
  updatedTimestamp: number
  forks: Forks
  fork: boolean
  parent: string | null
  private: boolean
  privateStateTxId?: string
  contributorInvites: ContributorInvite[]
  githubSync: GithubSync | null
}

export interface GithubSync {
  repository: string
  branch: string
  workflowId: string
  accessToken: string
  privateStateTxId: string
}

export interface RepoWithParent extends Repo {
  parentRepo?: Pick<Repo, 'id' | 'name' | 'owner'>
}

export type ContributorInvite = {
  address: string
  timestamp: number
  status: ContributorStatus
}

export type ContributorStatus = 'INVITED' | 'ACCEPTED' | 'REJECTED'

export type Forks = Record<Address, Pick<Repo, 'id' | 'name' | 'owner' | 'timestamp'>>

export type Deployment = {
  txId: string
  branch: string
  deployedBy: string
  commitOid: string
  commitMessage: string
  timestamp: number
}

export type Domain = {
  txId: string
  contractTxId: string
  name: string
  controller: string
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
  activities: PullRequestActivity[]
  linkedIssueId?: number
  timestamp: number
  mergedTimestamp?: number
  baseRepo: PRSide
  compareRepo: PRSide
}

export type PRSide = {
  repoId: string
  repoName: string
}

export type Issue = {
  id: number
  repoId: string
  title: string
  description: string
  author: string
  status: IssueStatus
  timestamp: number
  completedTimestamp?: number
  assignees: string[]
  activities: IssueActivity[]
  bounties: Bounty[]
  linkedPRIds?: number[]
}

export type Bounty = {
  id: number
  amount: number
  expiry: number
  status: BountyStatus
  paymentTxId: string | null
  timestamp: number
}

export type IssueActivity = IssueActivityStatus | IssueActivityComment

export type PullRequestActivity = PullRequestActivityStatus | PullRequestActivityComment

export type BaseActivity = {
  type: ActivityType
  author: string
  timestamp: number
}

export interface IssueActivityStatus extends BaseActivity {
  status: IssueStatus | 'REOPEN' | 'ASSIGNED'
  assignees?: Array<string>
}

export interface PullRequestActivityStatus extends BaseActivity {
  status: PullRequestStatus | 'REOPEN' | 'APPROVAL' | 'REVIEW_REQUEST'
  reviewers?: Array<string>
}

export interface IssueActivityComment extends BaseActivity {
  description: string
}

export interface PullRequestActivityComment extends BaseActivity {
  description: string
}

export type Reviewer = {
  address: string
  approved: boolean
}

export type PullRequestStatus = 'OPEN' | 'CLOSED' | 'MERGED'

export type ActivityType = 'STATUS' | 'COMMENT'

export type IssueStatus = 'OPEN' | 'COMPLETED'

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
  'forkRepository',
  'getRepository',
  'getRepositoriesByOwner',
  'getRepositoriesByContributor',
  'updateRepositoryTxId',
  'isRepositoryNameAvailable',
  'createPullRequest',
  'updatePullRequestStatus',
  'updatePullRequestDetails',
  'updateRepositoryDetails',
  'addDeployment',
  'addDomain',
  'updateDomain',
  'addContributor',
  'addCommentToPR',
  'updatePRComment',
  'inviteContributor',
  'acceptContributorInvite',
  'rejectContributorInvite',
  'addReviewersToPR',
  'approvePR',
  'linkIssueToPR',
  'createIssue',
  'updateIssueStatus',
  'updateIssueDetails',
  'addAssigneeToIssue',
  'addCommentToIssue',
  'updateIssueComment',
  'createNewBounty',
  'updateBounty',
  'updateProfileDetails',
  'getUserDetails',
  'isUsernameAvailable',
  'postEvolve',
  'updatePrivateStateTx',
  'cancelContributorInvite'
] as const

export type RepositoryFunction = (typeof repoFnList)[number] // more types will be added later

export type ContractResult<T> = { state: T } | { result: T }
