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
}

export type PullRequestStatus = 'OPEN' | 'CLOSED' | 'MERGED'
