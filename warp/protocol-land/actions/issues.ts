import { ContractResult, ContractState, Issue, RepositoryAction } from '../types'

declare const ContractError

export async function createNewIssue(
  state: ContractState,
  { caller, input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.repoId || !payload.title || !payload.description) {
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
    description: payload.description,
    author: caller,
    status: 'OPEN',
    assignees: [],
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
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.status || !payload.repoId || !payload.issueId) {
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

  issue.status = payload.status

  return { state }
}

export async function addAssigneeToIssue(
  state: ContractState,
  { input: { payload } }: RepositoryAction
): Promise<ContractResult<ContractState>> {
  if (!payload.repoId || !payload.issueId || !payload.assignees) {
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

  issue.assignees.push(...payload.assignees)

  return { state }
}
