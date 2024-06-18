import {
  Bounty,
  ContractResult,
  ContractState,
  Issue,
  IssueActivity,
  IssueActivityComment,
  IssueActivityStatus,
  RepositoryAction
} from '../types'
import { getBlockTimeStamp } from '../utils/getBlockTimeStamp'
import { isInvalidInput } from '../utils/isInvalidInput'

declare const ContractError

export async function createNewIssue(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.title, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  if (repo.private) {
    const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1

    if (!hasPermissions) {
      throw new ContractError('Error: You dont have permissions for this operation.')
    }
  }

  const description = isInvalidInput(payload.description, 'string', true) ? '' : payload.description

  const issue: Issue = {
    id: 1,
    repoId: payload.repoId,
    title: payload.title,
    description,
    author: caller,
    status: 'OPEN',
    assignees: [],
    activities: [],
    bounties: [],
    timestamp: getBlockTimeStamp()
  }

  const issuesCount = repo.issues.length

  if (issuesCount > 0) {
    issue.id = issuesCount + 1
  }

  repo.issues.push(issue)

  return { state }
}

export async function getAllIssuesByRepoId(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<Issue[]>> {
  // validate payload
  if (isInvalidInput(payload, 'object') || isInvalidInput(payload.repoId, 'uuid')) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  return { result: repo.issues }
}

export async function getIssueById(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<Issue[]>> {
  // validate payload
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.issueId, 'number')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const issue = repo.issues.filter((issue) => issue.id === payload.issueId)

  return { result: issue }
}

export async function updateIssueStatus(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.issueId, ['number', 'string']) ||
    isInvalidInput(payload.status, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const issue = repo.issues[+payload.issueId - 1]

  if (!issue) {
    throw new ContractError('Issue not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1 || caller === issue.author

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  const validStatusValues = ['COMPLETED', 'REOPEN']
  if (!validStatusValues.includes(payload.status)) {
    throw new ContractError('Invalid issue status specified. Must be one of: ' + validStatusValues.join(', '))
  }

  if (issue.status === payload.status) {
    throw new ContractError('Issue status is already set to the specified status.')
  }

  if (issue.status === 'OPEN' && payload.status === 'REOPEN') {
    throw new ContractError('Issue status is already set to OPEN')
  }

  const activity: IssueActivity = {
    type: 'STATUS',
    author: caller,
    timestamp: getBlockTimeStamp(),
    status: payload.status
  }

  issue.status = issue.status === 'COMPLETED' && payload.status === 'REOPEN' ? 'OPEN' : 'COMPLETED'
  issue.activities.push(activity)

  if (issue.status === 'COMPLETED') {
    issue.completedTimestamp = getBlockTimeStamp()
  }

  return { state }
}

export async function updateIssueDetails(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.issueId, ['number', 'string'])
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

  const issue = repo.issues[+payload.issueId - 1]

  if (!issue) {
    throw new ContractError('Issue not found.')
  }

  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1 || caller === issue.author

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  if (!isTitleInvalid) {
    issue.title = payload.title
  }

  if (!isDescriptionInvalid) {
    issue.description = payload.description
  }

  return { state }
}

export async function addAssigneeToIssue(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.issueId, ['number', 'string']) ||
    isInvalidInput(payload.assignees, 'array')
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

  const issue = repo.issues[+payload.issueId - 1]

  if (!issue) {
    throw new ContractError('Issue not found.')
  }

  const newAssignees = payload.assignees.filter((assignee: string) => !issue.assignees.includes(assignee))

  if (newAssignees.length === 0) {
    throw new ContractError('No new assignees to add.')
  }

  const issueAssignActivity: IssueActivityStatus = {
    type: 'STATUS',
    author: caller,
    status: 'ASSIGNED',
    timestamp: getBlockTimeStamp(),
    assignees: newAssignees
  }

  issue.assignees.push(...newAssignees)
  issue.activities.push(issueAssignActivity)

  return { state }
}

export async function addCommentToIssue(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.issueId, ['number', 'string']) ||
    isInvalidInput(payload.comment, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repo not found.')
  }

  const hasPermissions = repo.private ? caller === repo.owner || repo.contributors.indexOf(caller) > -1 : true

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  const issue = repo.issues[+payload.issueId - 1]

  if (!issue) {
    throw new ContractError('Issue not found.')
  }

  const comment: IssueActivity = {
    type: 'COMMENT',
    author: caller,
    description: payload.comment,
    timestamp: getBlockTimeStamp()
  }

  issue.activities.push(comment)

  return { state }
}

export async function updateIssueComment(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.issueId, ['number', 'string']) ||
    isInvalidInput(payload.comment, 'object') ||
    isInvalidInput(payload.comment.id, 'number') ||
    isInvalidInput(payload.comment.description, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repo not found.')
  }

  const issue = repo.issues[+payload.issueId - 1]

  if (!issue) {
    throw new ContractError('Issue not found.')
  }

  const commentActivity = issue.activities[payload.comment.id] as IssueActivityComment

  if (!commentActivity || commentActivity?.type !== 'COMMENT') {
    throw new ContractError('Comment not found.')
  }

  if (commentActivity.author !== caller) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  commentActivity.description = payload.comment.description

  return { state }
}

export async function createNewBounty(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.issueId, ['number', 'string']) ||
    isInvalidInput(payload.amount, 'number') ||
    isInvalidInput(payload.expiry, 'number')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repo not found.')
  }

  const issue = repo.issues[+payload.issueId - 1]

  if (!issue) {
    throw new ContractError('Issue not found.')
  }

  // if (caller !== issue.author) {
  //   throw new ContractError('Only author of this issue can create bounties.')
  // }
  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1 || caller === issue.author

  if (!hasPermissions) {
    throw new ContractError('Error: You dont have permissions for this operation.')
  }

  if (!payload.base) {
    payload.base = 'AR'
  }

  const bounty: Bounty = {
    id: 1,
    amount: payload.amount,
    expiry: payload.expiry,
    base: payload.base,
    paymentTxId: null,
    status: 'ACTIVE',
    timestamp: getBlockTimeStamp()
  }

  if (!issue?.bounties) {
    issue.bounties = []
  }

  const bountyCount = issue.bounties.length

  if (bountyCount > 0) {
    bounty.id = bountyCount + 1
  }

  issue.bounties.push(bounty)

  return { state }
}

export async function updateBounty(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (
    isInvalidInput(payload, 'object') ||
    isInvalidInput(payload.repoId, 'uuid') ||
    isInvalidInput(payload.issueId, ['number', 'string']) ||
    isInvalidInput(payload.bountyId, ['number', 'string']) ||
    isInvalidInput(payload.status, 'string')
  ) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const validStatusValues = ['ACTIVE', 'CLAIMED', 'EXPIRED', 'CLOSED']
  if (!validStatusValues.includes(payload.status)) {
    throw new ContractError('Invalid issue status specified. Must be one of: ' + validStatusValues.join(', '))
  }

  if (payload.status === 'CLAIMED' && !payload.paymentTxId) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repo not found.')
  }

  const issue = repo.issues[+payload.issueId - 1]

  if (!issue) {
    throw new ContractError('Issue not found.')
  }

  if (caller !== issue.author) {
    throw new ContractError('Only author of this issue can update bounties.')
  }

  const bounty = issue.bounties[+payload.bountyId - 1]

  if (!bounty) {
    throw new ContractError('Bounty not found.')
  }

  if (bounty.status !== 'ACTIVE') {
    throw new ContractError(`Bounty is not ACTIVE to set status to ${payload.status}`)
  }

  bounty.status = payload.status

  if (payload.status === 'CLAIMED') {
    bounty.paymentTxId = payload.paymentTxId
  }

  return { state }
}
