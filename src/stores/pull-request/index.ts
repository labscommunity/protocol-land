import { StateCreator } from 'zustand'

import { waitFor } from '@/helpers/waitFor'

import { CombinedSlices } from '../types'
import { PullRequestSlice, PullRequestState } from './types'

const initialPullRequestState: PullRequestState = {
  status: 'IDLE',
  error: null,
  baseBranch: '',
  compareBranch: '',
  commits: [],
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
        })
      }

      await waitFor(10000)

      set((state) => {
        state.pullRequestState.status = 'SUCCESS'
      })
    },
    compareBranches: async (branchA, branchB) => {
      console.log(branchA, branchB)
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
    }
  }
})

export default createPullRequestSlice
