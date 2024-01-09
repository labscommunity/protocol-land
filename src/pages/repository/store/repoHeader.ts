import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { GetArrayBufSizeReturnType } from '@/helpers/getArrayBufSize'

interface RepoHeaderState {
  repoHeaderState: {
    commits: number
    branches: number
    repoSize: string
    isLoading: boolean
  }
  setCommits: (commits: number) => void
  setBranches: (branches: number) => void
  setRepoSize: (sizeObj: GetArrayBufSizeReturnType) => void
  setIsLoading: (value: boolean) => void
}

const useRepoHeaderStore = create<RepoHeaderState>()(
  immer((set) => ({
    repoHeaderState: {
      commits: 0,
      branches: 0,
      repoSize: '0 B',
      isLoading: true
    },
    setCommits: (commits) =>
      set((state) => {
        state.repoHeaderState.commits = commits
      }),
    setBranches: (branches) =>
      set((state) => {
        state.repoHeaderState.branches = branches
      }),
    setRepoSize: (sizeObj) =>
      set((state) => {
        const sizeStr = `${sizeObj.size} ${sizeObj.unit}`
        state.repoHeaderState.repoSize = sizeStr
      }),
    setIsLoading: (value) =>
      set((state) => {
        state.repoHeaderState.isLoading = value
      })
  }))
)

export { useRepoHeaderStore }
