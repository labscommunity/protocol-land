import { StateCreator } from 'zustand'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { withAsync } from '@/helpers/withAsync'
import { addReviewersToPR, approvePR, closePullRequest, updatePullRequestDetails } from '@/lib/git/pull-request'
import { PullRequest } from '@/types/repository'

import { CombinedSlices } from '../types'
import { compareTwoBranches, getChangedFiles, mergePR, traverseAndCopyForkObjects } from './actions'
import { PullRequestSlice, PullRequestState } from './types'

const initialPullRequestState: PullRequestState = {
  status: 'IDLE',
  error: null,
  baseBranch: '',
  baseBranchOid: '',
  compareBranch: '',
  baseRepo: null,
  compareRepo: null,
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
    reset: () => {
      set((state) => {
        state.pullRequestState = initialPullRequestState
      })
    },
    prepareAndCopyForkCommits: async (PR) => {
      const parentRepo = get().repoCoreState.selectedRepo.repo
      const forkedRepo = get().repoCoreState.forkRepo.repo

      if (!parentRepo || !forkedRepo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      if (forkedRepo.id !== PR.compareRepo.repoId) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      const commits = get().pullRequestState.commits
      const { response, error } = await withAsync(() =>
        traverseAndCopyForkObjects(
          PR.compareRepo.repoId,
          PR.compareRepo.repoName,
          commits,
          parentRepo.id,
          parentRepo.name
        )
      )

      if (error || !response) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      get().pullRequestActions.setCompareBranch(response.compareBranch)
      await get().pullRequestActions.getFileStatuses(PR.baseBranchOid, response.compareBranch)
    },
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
          state.pullRequestState.baseRepo = repo
          state.pullRequestState.compareRepo = repo
          state.pullRequestState.compareBranch = currentBranch
          state.pullRequestState.status = 'SUCCESS'
        })
      }
    },
    compareBranches: async (prSideOptions) => {
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

      if (repo.fork && !get().repoCoreState.parentRepo.repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => compareTwoBranches(prSideOptions))

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

      const { error, response } = await withAsync(() => getChangedFiles(repo.id, repo.name, branchA, branchB))

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
    setBaseRepo: (repo) => {
      set((state) => {
        state.pullRequestState.baseRepo = repo
      })
    },
    setCompareRepo: (repo) => {
      set((state) => {
        state.pullRequestState.compareRepo = repo
      })
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
      const forkedRepo = get().repoCoreState.forkRepo.repo
      const isFork = forkedRepo ? true : false

      if (!repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() =>
        mergePR(repo.id, id, repo.name, baseBranch, compareBranch, author!, isFork, repo.private, repo.privateStateTxId)
      )

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.pullRequests[id - 1].status = 'MERGED'
        })

        trackGoogleAnalyticsEvent('Repository', 'Merge a PR', 'Merge PR', {
          repo_name: repo.name,
          repo_id: repo.id,
          pr_id: id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Merge a PR', 'Merge PR', {
          repo_name: repo.name,
          repo_id: repo.id,
          pr_id: id,
          result: 'FAILED'
        })
        throw error
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

        trackGoogleAnalyticsEvent('Repository', 'Close a PR', 'Close PR', {
          repo_name: repo.name,
          repo_id: repo.id,
          pr_id: id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Close a PR', 'Close PR', {
          repo_name: repo.name,
          repo_id: repo.id,
          pr_id: id,
          result: 'FAILED'
        })
        throw error
      }
    },
    updatePullRequestDetails: async (id, updateData: Partial<PullRequest>) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => updatePullRequestDetails(repo.id, id, updateData))

      if (!error) {
        set((state) => {
          const pr = state.repoCoreState.selectedRepo.repo!.pullRequests[id - 1]
          state.repoCoreState.selectedRepo.repo!.pullRequests[id - 1] = { ...pr, ...updateData }
        })

        trackGoogleAnalyticsEvent('Repository', 'Update a PR', 'Update PR', {
          repo_name: repo.name,
          repo_id: repo.id,
          pr_id: id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Update an PR', 'Update PR', {
          repo_name: repo.name,
          repo_id: repo.id,
          pr_id: id,
          result: 'FAILED'
        })
        throw error
      }
    },
    getReviewersList: (prId: number) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.pullRequestState.status = 'ERROR'))

        return []
      }

      const PR = repo.pullRequests[prId - 1]

      if (!PR || !PR?.reviewers) return []

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

        trackGoogleAnalyticsEvent('Repository', 'Add or update PR reviewers', 'Modify PR reviewers', {
          repo_name: repo.name,
          repo_id: repo.id,
          pr_id: id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Add or update PR reviewers', 'Modify reviewers', {
          repo_name: repo.name,
          repo_id: repo.id,
          pr_id: id,
          result: 'FAILED'
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

        trackGoogleAnalyticsEvent('Repository', 'Approve a PR', 'Approve PR', {
          repo_name: repo.name,
          repo_id: repo.id,
          pr_id: id,
          result: 'SUCCESS'
        })
      }

      if (error) {
        trackGoogleAnalyticsEvent('Repository', 'Approve a PR', 'Approve PR', {
          repo_name: repo.name,
          repo_id: repo.id,
          pr_id: id,
          result: 'FAILED'
        })
      }
    }
  }
})

export default createPullRequestSlice
