import { StateCreator } from 'zustand'

import { withAsync } from '@/helpers/withAsync'
import { addReviewersToPR, approvePR, closePullRequest } from '@/lib/git/pull-request'

import { CombinedSlices } from '../types'
import { compareTwoBranches, getChangedFiles, mergePR } from './actions'
import { PullRequestSlice, PullRequestState } from './types'

const initialPullRequestState: PullRequestState = {
  status: 'IDLE',
  error: null,
  baseBranch: '',
  baseBranchOid: '',
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
    setBaseBranchOid: (oid) => {
      set((state) => {
        state.pullRequestState.baseBranchOid = oid
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
    },
    getReviewersList: (prId: number) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return []
      }

      const PR = repo.pullRequests[prId - 1]

      if(!PR || !PR?.reviewers) return []

      const currentReviewersAddresses = PR?.reviewers?.map((reviewer) => reviewer.address)
      const reviewers = [...repo.contributors, repo.owner]

      const filteredReviewers = reviewers.filter(
        (address) => currentReviewersAddresses.indexOf(address) < 0 && address !== PR.author
      )

      return filteredReviewers
    },
    addReviewers: async (id, reviewers) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => addReviewersToPR({ repoId: repo.id, prId: id, reviewers }))

      if (!error) {
        set((state) => {
          const reviewersMap = reviewers.map((address) => ({ address, approved: false }))

          state.repoCoreState.selectedRepo.repo!.pullRequests[id - 1].reviewers.push(...reviewersMap)
        })
      }
    },
    approvePR: async (id) => {
      const repo = get().repoCoreState.selectedRepo.repo
      const address = get().authState.address

      if (!repo || !address) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      const PR = repo.pullRequests[id - 1]

      const { error } = await withAsync(() => approvePR({ repoId: repo.id, prId: PR.id }))

      if (!error) {
        const reviewerIdx = PR.reviewers.findIndex((reviewer) => reviewer.address === address)

        set((state) => {
          state.repoCoreState.selectedRepo.repo!.pullRequests[id - 1].reviewers[reviewerIdx].approved = true
        })
      }
    }
  }
})

export default createPullRequestSlice
