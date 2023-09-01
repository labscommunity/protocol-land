import { CommitResult } from '@/types/commit'

export interface PullRequestSlice {
  pullRequestState: PullRequestState
  pullRequestActions: PullRequestActions
}

export type PullRequestState = {
  status: ApiStatus
  error: unknown | null
  baseBranch: string
  compareBranch: string
  commits: CommitResult[]
  reviewers: []
}

export type PullRequestActions = {
  setBaseBranch: (branch: string) => void
  setCompareBranch: (branch: string) => void
  setCommits: (commits: CommitResult[]) => void
  compareBranches: (branchA: string, branchB: string) => Promise<void>
  setDefaultBranches: () => Promise<void>
}
