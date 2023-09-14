import { Issue } from '@/types/repository'

export interface IssuesSlice {
  issuesState: IssuesState
  issuesActions: IssuesActions
}

export type IssuesState = {
  status: ApiStatus
  error: unknown | null
  assignees: string[]
  selectedIssue: null | Issue
}

export type IssuesActions = {
  reset: () => void
  setSelectedIssue: (issue: Issue) => void
  createIssue: (title: string, description: string) => Promise<undefined | Issue>
  reopenIssue: (id: number) => Promise<void>
  closeIssue: (id: number) => Promise<void>
  getAssigneesList: (id: number) => string[]
  addAssignee: (id: number, assignees: string[]) => Promise<void>
}
