export interface BranchSlice {
  branchState: BranchState
  branchActions: BranchActions
}

export type BranchState = {
  status: ApiStatus
  error: unknown | null
  branchList: string[]
  currentBranch: string
}

export type BranchActions = {
  listBranches: () => Promise<void>
  getActiveBranch: () => Promise<void>
  createNewBranch: (branchName: string) => Promise<void>
  switchBranch: (branchName: string) => Promise<void>
}
