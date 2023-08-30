import { StateCreator } from 'zustand'

import { withAsync } from '@/helpers/withAsync'

import { CombinedSlices } from '../types'
import { addNewBranch, changeBranch, getBranchList, getCurrentActiveBranch } from './actions'
import { BranchSlice, BranchState } from './types'

const initialBranchState: BranchState = {
  status: 'IDLE',
  error: null,
  branchList: [],
  currentBranch: 'master'
}

const createBranchSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], BranchSlice> = (
  set,
  get
) => ({
  branchState: initialBranchState,
  branchActions: {
    listBranches: async () => {
      set((state) => {
        state.branchState.status = 'PENDING'
      })

      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.branchState.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => getBranchList(repo.name))

      if (error) {
        set((state) => {
          state.branchState.error = error
          state.branchState.status = 'ERROR'
        })
      }

      if (response) {
        set((state) => {
          state.branchState.branchList = response
          state.branchState.status = 'SUCCESS'
        })
      }
    },
    getActiveBranch: async () => {
      set((state) => {
        state.branchState.status = 'PENDING'
      })

      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.branchState.status = 'ERROR'))

        return
      }

      const { error, result } = await getCurrentActiveBranch(repo.name)

      if (error) {
        set((state) => {
          state.branchState.error = error
          state.branchState.status = 'ERROR'
        })
      }

      if (result) {
        set((state) => {
          state.branchState.currentBranch = result
          state.branchState.status = 'SUCCESS'
        })
      }
    },
    createNewBranch: async (branchName) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.branchState.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => addNewBranch(repo.name, branchName))

      if (error) {
        set((state) => {
          state.branchState.error = error
          state.branchState.status = 'ERROR'
        })
      }

      if (!error) {
        await get().branchActions.listBranches()
        await get().branchActions.getActiveBranch()
      }
    },

    switchBranch: async (branchName) => {
      set((state) => {
        state.branchState.status = 'PENDING'
      })

      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.branchState.status = 'ERROR'))

        return
      }

      const { error } = await changeBranch(repo.name, branchName)

      if (error) {
        set((state) => {
          state.branchState.error = error
          state.branchState.status = 'ERROR'
        })
      }

      if (!error) {
        await get().branchActions.getActiveBranch()
        await get().repoCoreActions.loadFilesFromRepo()
      }
    }
  }
})

export default createBranchSlice
