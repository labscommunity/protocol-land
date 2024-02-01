import { CommitResult } from '@/types/commit'
import { PullRequest, Repo, Reviewer } from '@/types/repository'

export interface PullRequestSlice {
  pullRequestState: PullRequestState
  pullRequestActions: PullRequestActions
}

export type PullRequestState = {
  status: ApiStatus
  error: unknown | null
  baseBranch: string
  baseBranchOid: string
  compareBranch: string
  baseRepo: Repo | null
  compareRepo: Repo | null
  commits: CommitResult[]
  fileStatuses: FileStatus[]
  reviewers: Reviewer[]
}

export type FileStatus = [string, number, number, number]

export type PullRequestActions = {
  reset: () => void
  setBaseRepo: (repo: Repo) => void
  setCompareRepo: (repo: Repo) => void
  setBaseBranch: (branch: string) => void
  setBaseBranchOid: (oid: string) => void
  setCompareBranch: (branch: string) => void
  setCommits: (commits: CommitResult[]) => void
  getFileStatuses: (branchA: string, branchB: string) => Promise<void>
  prepareAndCopyForkCommits: (pr: PullRequest) => Promise<void>
  compareBranches: (prSideOptions: PRSideOptions) => Promise<void>
  setDefaultBranches: () => Promise<void>
  mergePullRequest: (id: number, dryRun?: boolean) => Promise<void | any>
  closePullRequest: (id: number) => Promise<void>
  reopenPullRequest: (id: number) => Promise<void>
  updatePullRequestDetails: (id: number, updateData: Partial<PullRequest>) => Promise<void>
  getReviewersList: (id: number) => string[]
  addReviewers: (id: number, reviewers: string[]) => Promise<void>
  addComment: (id: number, comment: string) => Promise<void>
  updateComment: (id: number, comment: { id: number; description: string }) => Promise<void>
  approvePR: (id: number) => Promise<void>
  linkIssue: (id: number, issueId: number) => Promise<void>
}

export type PRSide = {
  branch: string
  repoName: string
  id: string
}

export type PRSideOptions = {
  base: PRSide
  compare: PRSide
}
