import { ContractResult, ContractState, PullRequest, RepositoryAction, Reviewer } from '../types'

declare const ContractError

export async function createNewPullRequest(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    !payload.repoId ||
    !payload.title ||
    !payload.description ||
    !payload.baseBranch ||
    !payload.compareBranch ||
    !payload.baseBranchOid
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const pullRequest: PullRequest = {
    id: 1,
    repoId: payload.repoId,
    title: payload.title,
    description: payload.description,
    baseBranch: payload.baseBranch,
    compareBranch: payload.compareBranch,
    baseBranchOid: payload.baseBranchOid,
    author: caller,
    status: 'OPEN',
    reviewers: [],
    timestamp: Date.now()
  }

  const pullRequestsCount = repo.pullRequests.length

  if (pullRequestsCount > 0) {
    pullRequest.id = pullRequestsCount + 1
  }

  repo.pullRequests.push(pullRequest)

  return { state }
}

export async function getAllPullRequestsByRepoId(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<PullRequest[]>> {
  // validate payload
  if (!payload.repoId) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  return { result: repo.pullRequests }
}

export async function getPullRequestById(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<PullRequest[]>> {
  // validate payload
  if (!payload.repoId || payload.prId) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const PR = repo.pullRequests.filter((pr) => pr.id === payload.prId)

  return { result: PR }
}

export async function updatePullRequestStatus(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.status || !payload.repoId || !payload.prId) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const PR = repo.pullRequests[+payload.prId - 1]

  if (!PR) {
    throw new ContractError('Pull Request not found.')
  }

  PR.status = payload.status

  return { state }
}

export async function addReviewerToPR(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.repoId || !payload.prId || !payload.reviewer) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const PR = repo.pullRequests[+payload.prId - 1]

  if (!PR) {
    throw new ContractError('Pull Request not found.')
  }

  const isValidReviewer = repo.contributors.find(payload.reviewer)

  if (!isValidReviewer) {
    throw new ContractError('Reviewer must be a contributor.')
  }

  const reviewer: Reviewer = {
    address: payload.reviewer,
    approved: false
  }

  PR.reviewers.push(reviewer)

  return { state }
}
