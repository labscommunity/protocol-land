import { Bounty, Comment, ContractResult, ContractState, Issue, RepositoryAction } from '../types'

declare const ContractError

export async function createNewIssue(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.repoId || !payload.title) {
    throw new ContractError('Invalid inputs supplied.')
  }

  const repo = state.repos[payload.repoId]

  if (!repo) {
    throw new ContractError('Repository not found.')
  }

  const issue: Issue = {
    id: 1,
    repoId: payload.repoId,
    title: payload.title,
    description: payload.description ?? '',
    author: caller,
    status: 'OPEN',
    assignees: [],
    comments: [],
    bounties: [],
    timestamp: Date.now()
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
  if (!payload.repoId) {
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
  if (!payload.repoId || payload.issueId) {
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
  if (!payload.status || !payload.repoId || !payload.issueId) {
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

  const issue = repo.issues[+payload.issueId - 1]

  if (!issue) {
    throw new ContractError('Issue not found.')
  }

  issue.status = payload.status

  return { state }
}

export async function updateIssueDetails(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.repoId || !payload.issueId) {
    throw new ContractError('repoId and issueId are required.')
  }

  if (!payload.title && !payload.description) {
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

  const issue = repo.issues[+payload.issueId - 1]

  if (!issue) {
    throw new ContractError('Issue not found.')
  }

  if (payload.title) {
    issue.title = payload.title
  }

  if (payload.description) {
    issue.description = payload.description
  }

  return { state }
}

export async function addAssigneeToIssue(
  state: ContractState,
  { input: { payload }, caller }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.repoId || !payload.issueId || !payload.assignees) {
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

  issue.assignees.push(...newAssignees)

  return { state }
}

export async function addCommentToIssue(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.repoId || !payload.issueId || !payload.comment) {
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

  const comment: Comment = {
    author: caller,
    description: payload.comment,
    timestamp: Date.now()
  }

  if (!issue?.comments) {
    issue.comments = []
  }

  issue.comments.push(comment)

  return { state }
}

export async function createNewBounty(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.repoId || !payload.issueId || !payload.amount || !payload.expiry) {
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
    throw new ContractError('Only author of this issue can create bounties.')
  }

  const bounty: Bounty = {
    id: 1,
    amount: payload.amount,
    expiry: payload.expiry,
    paymentTxId: null,
    status: 'ACTIVE',
    timestamp: Date.now()
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
  if (!payload.repoId || !payload.issueId || !payload.bountyId || !payload.status) {
    throw new ContractError('Invalid inputs supplied.')
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

  bounty.status = payload.status

  if (payload.status === 'CLAIMED') {
    bounty.paymentTxId = payload.paymentTxId
  }

  return { state }
}
