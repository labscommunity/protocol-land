export type Repo = {
  id: string
  name: string
  description: string
  dataTxId: string
  owner: string
  pullRequests: PullRequest[]
}

export type PullRequest = {
  id: number
  repoId: string
  title: string
  description: string
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
