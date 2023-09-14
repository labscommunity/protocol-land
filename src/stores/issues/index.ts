import { StateCreator } from 'zustand'

import { withAsync } from '@/helpers/withAsync'
import { Issue } from '@/types/repository'

import { CombinedSlices } from '../types'
import { addAssigneeToIssue, addCommentToIssue, closeIssue, createNewIssue, reopenIssue } from './actions'
import { IssuesSlice, IssuesState } from './types'

const initialIssuesState: IssuesState = {
  status: 'IDLE',
  error: null,
  assignees: [],
  selectedIssue: null
}

const createPullRequestSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], IssuesSlice> = (
  set,
  get
) => ({
  issuesState: initialIssuesState,
  issuesActions: {
    reset: () => {
      set((state) => {
        state.issuesState = initialIssuesState
      })
    },
    setSelectedIssue: (issue: Issue) => {
      set((state) => {
        state.issuesState.selectedIssue = issue
      })
    },
    createIssue: async (title, description) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => createNewIssue(title, description, repo.id))

      if (!error && response) {
        return response
      }
    },
    reopenIssue: async (id) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => reopenIssue(repo.id, id))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.issues[id - 1].status = 'OPEN'
        })
      }
    },
    closeIssue: async (id) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => closeIssue(repo.id, id))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.issues[id - 1].status = 'COMPLETED'
        })
      }
    },
    getAssigneesList: (issueId: number) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return []
      }

      const issue = repo.issues[issueId - 1]

      if (!issue || !issue?.assignees) return []

      const currentAssignees = issue?.assignees
      const reviewers = [...repo.contributors, repo.owner]

      const filteredReviewers = reviewers.filter((address) => currentAssignees.indexOf(address) < 0)

      return filteredReviewers
    },
    addAssignee: async (id, assignees) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => addAssigneeToIssue(repo.id, id, assignees))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.issues[id - 1].assignees.push(...assignees)
        })
      }
    },
    addComment: async (id, comment) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => addCommentToIssue(repo.id, id, comment))

      if (!error && response) {
        const comments = response?.comments

        if (!comments || !Array.isArray(comments)) return

        set((state) => {
          state.repoCoreState.selectedRepo.repo!.issues[id - 1].comments = comments
        })
      }
    }
  }
})

export default createPullRequestSlice
