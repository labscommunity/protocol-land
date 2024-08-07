import { StateCreator } from 'zustand'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { withAsync } from '@/helpers/withAsync'
import { Issue } from '@/types/repository'

import { CombinedSlices } from '../types'
import {
  addAssigneeToIssue,
  addCommentToIssue,
  closeIssue,
  createNewIssue,
  reopenIssue,
  updateIssueComment,
  updateIssueDetails
} from './actions'
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
    isContributorOrIssueAuthor: () => {
      const { repoCoreState, authState, issuesState } = get()
      const { repo } = repoCoreState.selectedRepo
      const userAddress = authState.address

      if (!repo || !userAddress) {
        return false
      }

      return (
        repo.owner === userAddress ||
        repo.contributors.includes(userAddress) ||
        userAddress === issuesState.selectedIssue?.author
      )
    },
    setSelectedIssue: (issue: Issue) => {
      set((state) => {
        state.issuesState.selectedIssue = issue
      })
    },
    createIssue: async (title, description) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const address = get().authState.address

      if (!repo || !address) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => createNewIssue(title, description, repo.id, address))

      if (!error && response) {
        trackGoogleAnalyticsEvent('Repository', 'Create a new issue', 'Create issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: response.id,
          result: 'SUCCESS'
        })

        return response
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Create a new issue', 'Create issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          result: 'FAILED'
        })
        throw error
      }
    },
    reopenIssue: async (id) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => reopenIssue(repo.id, id))

      if (!error && response) {
        const activities = response?.activities

        if (!activities || !Array.isArray(activities)) return

        set((state) => {
          const issue = state.repoCoreState.selectedRepo.repo!.issues[id - 1]
          issue.activities = activities
          issue.status = 'OPEN'
        })

        trackGoogleAnalyticsEvent('Repository', 'Reopen a issue', 'Reopen issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Reopen a issue', 'Reopen issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          result: 'FAILED'
        })
        throw error
      }
    },
    closeIssue: async (id) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => closeIssue(repo.id, id))

      if (!error && response) {
        const activities = response?.activities

        if (!activities || !Array.isArray(activities)) return

        set((state) => {
          const issue = state.repoCoreState.selectedRepo.repo!.issues[id - 1]
          issue.activities = activities
          issue.completedTimestamp = response.completedTimestamp
          issue.status = 'COMPLETED'
        })

        trackGoogleAnalyticsEvent('Repository', 'Close an issue', 'Close issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Close an issue', 'Close issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          result: 'FAILED'
        })
        throw error
      }
    },
    updateIssueDetails: async (id, updateData: Partial<Issue>) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => updateIssueDetails(repo.id, id, updateData))

      if (!error) {
        set((state) => {
          const issue = state.repoCoreState.selectedRepo.repo!.issues[id - 1]
          state.repoCoreState.selectedRepo.repo!.issues[id - 1] = { ...issue, ...updateData }
        })

        trackGoogleAnalyticsEvent('Repository', 'Update an issue', 'Update issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Update an issue', 'Update issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          result: 'FAILED'
        })
        throw error
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

      const { error, response } = await withAsync(() => addAssigneeToIssue(repo.id, id, assignees))

      if (!error && response) {
        const activities = response?.activities

        if (!activities || !Array.isArray(activities)) return

        set((state) => {
          const issue = state.repoCoreState.selectedRepo.repo!.issues[id - 1]
          issue.assignees.push(...assignees)
          issue.activities = activities
        })

        trackGoogleAnalyticsEvent('Repository', 'Add or update assignee to issue', 'Modify issue assignee', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Add or update assignee to issue', 'Modify issue assignee', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          result: 'FAILED'
        })
        throw error
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
        const activities = response?.activities

        if (!activities || !Array.isArray(activities)) return

        set((state) => {
          state.repoCoreState.selectedRepo.repo!.issues[id - 1].activities = activities
        })

        trackGoogleAnalyticsEvent('Repository', 'Add comment to issue', 'Comment on issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Add comment to issue', 'Comment on issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          result: 'FAILED'
        })
        throw error
      }
    },
    updateComment: async (id, comment) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.issuesState.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => updateIssueComment(repo.id, id, comment))

      if (!error && response) {
        const activities = response?.activities

        if (!activities || !Array.isArray(activities)) return

        set((state) => {
          state.repoCoreState.selectedRepo.repo!.issues[id - 1].activities = activities
        })

        trackGoogleAnalyticsEvent('Repository', 'Update comment to issue', 'Update Comment on issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          comment_id: comment.id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Update comment to issue', 'Update Comment on issue', {
          repo_name: repo.name,
          repo_id: repo.id,
          issue_id: id,
          comment_id: comment.id,
          result: 'FAILED'
        })
        throw error
      }
    }
  }
})

export default createPullRequestSlice
