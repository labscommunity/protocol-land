import { StateCreator } from 'zustand'

import { withAsync } from '@/helpers/withAsync'
import { closePullRequest } from '@/lib/git/pull-request'

import { CombinedSlices } from '../types'
import { compareTwoBranches, getChangedFiles, mergePR } from './actions'
import { PullRequestSlice, PullRequestState } from './types'

const initialPullRequestState: PullRequestState = {
  status: 'IDLE',
  error: null,
  baseBranch: '',
  compareBranch: '',
  commits: [],
  fileStatuses: [],
  reviewers: []
}

const createPullRequestSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], PullRequestSlice> = (
  set,
  get
) => ({
  pullRequestState: initialPullRequestState,
  pullRequestActions: {
    setDefaultBranches: async () => {
      set((state) => {
        state.pullRequestState.status = 'PENDING'
      })

      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      await get().branchActions.listBranches()
      await get().branchActions.getActiveBranch()

      const { error, status, currentBranch } = get().branchState

      if (error) {
        set((state) => {
          state.pullRequestState.error = error
          state.pullRequestState.status = 'ERROR'
        })
      }

      if (status === 'SUCCESS') {
        set((state) => {
          state.pullRequestState.baseBranch = currentBranch
          state.pullRequestState.compareBranch = currentBranch
          state.pullRequestState.status = 'SUCCESS'
        })
      }
    },
    compareBranches: async (branchA, branchB) => {
      const status = get().pullRequestState.status

      if (status !== 'PENDING') {
        set((state) => {
          state.pullRequestState.status = 'PENDING'
        })
      }

      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => compareTwoBranches(repo.name, branchA, branchB))

      if (error) {
        set((state) => {
          state.pullRequestState.error = error
          state.pullRequestState.status = 'ERROR'
        })
      }

      if (response) {
        set((state) => {
          state.pullRequestState.commits = response
          state.pullRequestState.status = 'SUCCESS'
        })
      }
    },
    getFileStatuses: async (branchA, branchB) => {
      const status = get().pullRequestState.status

      if (status !== 'PENDING') {
        set((state) => {
          state.pullRequestState.status = 'PENDING'
        })
      }

      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => getChangedFiles(repo.name, branchA, branchB))

      if (error) {
        set((state) => {
          state.pullRequestState.error = error
          state.pullRequestState.status = 'ERROR'
        })
      }

      if (response) {
        set((state) => {
          state.pullRequestState.fileStatuses = response
          state.pullRequestState.status = 'SUCCESS'
        })
      }
    },
    setBaseBranch: (branch) => {
      set((state) => {
        state.pullRequestState.baseBranch = branch
      })
    },
    setCompareBranch: (branch) => {
      set((state) => {
        state.pullRequestState.compareBranch = branch
      })
    },
    setCommits: (commits) => {
      set((state) => {
        state.pullRequestState.commits = commits
      })
    },
    mergePullRequest: async (id) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const baseBranch = get().pullRequestState.baseBranch
      const compareBranch = get().pullRequestState.compareBranch
      const author = get().authState.address

      if (!repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => mergePR(repo.id, id, repo.name, baseBranch, compareBranch, author!))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.pullRequests[id - 1].status = 'MERGED'
        })
      }
    },
    closePullRequest: async (id) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => closePullRequest({ repoId: repo.id, prId: id }))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.pullRequests[id - 1].status = 'CLOSED'
        })
      }
    }
  }
})

export default createPullRequestSlice
