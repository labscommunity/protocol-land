import {
  ContractResult,
  ContractState,
  PullRequest,
  PullRequestActivity,
  PullRequestActivityComment,
  PullRequestActivityStatus,
  RepositoryAction,
  Reviewer
} from '../types'
import { getBlockTimeStamp } from '../utils/getBlockTimeStamp'
import { isInvalidInput } from '../utils/isInvalidInput'
import { pickKeys } from '../utils/pickKeys'

declare const ContractError

export async function createNewPullRequest(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.title, 'string') ||
    isInvalidInput(payload.baseBranch, 'string') ||
    isInvalidInput(payload.compareBranch, 'string') ||
    isInvalidInput(payload.baseBranchOid, 'string') ||
    isInvalidInput(payload.baseRepo, 'object') ||
    isInvalidInput(payload.baseRepo.repoId, 'uuid') ||
    isInvalidInput(payload.baseRepo.repoName, 'string') ||
    isInvalidInput(payload.compareRepo, 'object') ||
    isInvalidInput(payload.compareRepo.repoId, 'uuid') ||
    isInvalidInput(payload.compareRepo.repoName, 'string') ||
    isInvalidInput(payload.description, 'string', true)
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const isSimilarPrOpen =
    repo.pullRequests.findIndex(
      (pr) =>
        pr.baseBranch === payload.baseBranch &&
        pr.compareBranch === payload.compareBranch &&
        pr.baseRepo.repoId === payload.baseRepo.repoId &&
        pr.compareRepo.repoId === payload.compareRepo.repoId &&
        pr.status === 'OPEN'
    ) > -1

  if (isSimilarPrOpen) {
    throw new ContractError('A similar open PR already exists for the specified branches and repositories.')
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
    activities: [],
    timestamp: Date.now(),
    baseRepo: pickKeys(payload.baseRepo, ['repoId', 'repoName']),
    compareRepo: pickKeys(payload.compareRepo, ['repoId', 'repoName'])
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
  if (isInvalidInput(payload, 'object') || isInvalidInput(payload.repoId, 'uuid')) {
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
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.prId, 'number')
  ) {
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
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.prId, ['number', 'string']) ||
    isInvalidInput(payload.status, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  const PR = repo.pullRequests[+payload.prId - 1]

  if (!PR) {
    throw new ContractError('Pull Request not found.')
  }

  if (PR.status === 'MERGED') {
    throw new Error('Pull Request already merged')
  }

  const validStatusValues = ['REOPEN', 'CLOSED', 'MERGED']
  if (!validStatusValues.includes(payload.status)) {
    throw new ContractError('Invalid Pull Request status specified. Must be one of: ' + validStatusValues.join(', '))
  }

  if (PR.status === payload.status) {
    throw new ContractError('Pull Request status is already set to the specified status.')
  }

  if (PR.status === 'OPEN' && payload.status === 'REOPEN') {
    throw new ContractError('Pull Request status is already set to OPEN')
  }

  if (PR.status === 'CLOSED' && payload.status === 'MERGED') {
    throw new Error('Pull Request is closed; Reopen to merge')
  }

  const activity: PullRequestActivity = {
    type: 'STATUS',
    author: caller,
    timestamp: getBlockTimeStamp(),
    status: payload.status
  }

  if (!Array.isArray(PR.activities)) {
    PR.activities = []
  }

  PR.status = PR.status === 'CLOSED' && payload.status === 'REOPEN' ? 'OPEN' : payload.status
  PR.activities.push(activity)

  if (PR.status === 'MERGED') {
    PR.mergedTimestamp = getBlockTimeStamp()
  }

  return { state }
}

export async function updatePullRequestDetails(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.prId, ['number', 'string'])
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const isTitleInvalid = isInvalidInput(payload.title, 'string')
  const isDescriptionInvalid = isInvalidInput(payload.description, 'string', true)

  if (isTitleInvalid && isDescriptionInvalid) {
    throw new ContractError('Either title or description should be present.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  const PR = repo.pullRequests[+payload.prId - 1]

  if (!PR) {
    throw new ContractError('Pull Request not found.')
  }

  if (!isTitleInvalid) {
    PR.title = payload.title
  }

  if (!isDescriptionInvalid) {
    PR.description = payload.description
  }

  return { state }
}

export async function addReviewersToPR(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.prId, ['number', 'string']) ||
    isInvalidInput(payload.reviewers, 'array')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  const PR = repo.pullRequests[+payload.prId - 1]

  if (!PR) {
    throw new ContractError('Pull Request not found.')
  }

  const newReviewers = payload.reviewers.filter(
    (reviewer: string) => !PR.reviewers.some((existingReviewer) => existingReviewer.address === reviewer)
  )

  if (newReviewers.length === 0) {
    throw new ContractError('No new reviewers to add.')
  }

  if (!Array.isArray(PR.activities)) {
    PR.activities = []
  }

  const reviewers: Reviewer[] = newReviewers.map((reviewer: string) => ({
    address: reviewer,
    approved: false
  }))

  const reviewRequestActivity: PullRequestActivityStatus = {
    type: 'STATUS',
    author: caller,
    status: 'REVIEW_REQUEST',
    timestamp: getBlockTimeStamp(),
    reviewers: newReviewers
  }

  PR.reviewers.push(...reviewers)
  PR.activities.push(reviewRequestActivity)

  return { state }
}

export async function approvePR(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.prId, ['number', 'string'])
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  const PR = repo.pullRequests[+payload.prId - 1]

  if (!PR) {
    throw new ContractError('Pull Request not found.')
  }

  const reviewerIdx = PR.reviewers.findIndex((reviewer) => reviewer.address === caller)

  if (reviewerIdx < 0) {
    throw new ContractError('Reviewer not found.')
  }

  if (!PR.reviewers[reviewerIdx].approved) {
    if (!Array.isArray(PR.activities)) {
      PR.activities = []
    }

    const activity: PullRequestActivityStatus = {
      type: 'STATUS',
      status: 'APPROVAL',
      author: caller,
      timestamp: getBlockTimeStamp()
    }
    PR.reviewers[reviewerIdx].approved = true
    PR.activities.push(activity)
  }

  return { state }
}

export async function addCommentToPR(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.prId, ['number', 'string']) ||
    isInvalidInput(payload.comment, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repo not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  const PR = repo.pullRequests[+payload.prId - 1]

  if (!PR) {
    throw new ContractError('Pull Request not found.')
  }

  if (!Array.isArray(PR.activities)) {
    PR.activities = []
  }

  const comment: PullRequestActivityComment = {
    type: 'COMMENT',
    author: caller,
    description: payload.comment,
    timestamp: getBlockTimeStamp()
  }

  PR.activities.push(comment)

  return { state }
}
