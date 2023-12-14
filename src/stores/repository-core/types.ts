import { UserCommit, UserContributionData, UserPROrIssue } from '@/lib/user'
import { CommitResult } from '@/types/commit'
import { Deployment, Repo } from '@/types/repository'

export interface RepoCoreSlice {
  repoCoreState: RepoCoreState
  repoCoreActions: RepoCoreActions
}

export type RepoCoreState = {
  selectedRepo: {
    status: ApiStatus
    error: unknown | null
    repo: Repo | null
    statistics: {
      commits: UserCommit[]
      pullRequests: UserPROrIssue[]
      issues: UserPROrIssue[]
    }
  }
  parentRepo: {
    status: ApiStatus
    error: unknown | null
    repo: Repo | null
  }
  forkRepo: {
    status: ApiStatus
    error: unknown | null
    repo: Repo | null
  }
  git: {
    status: ApiStatus
    error: unknown | null
    rootOid: string
    currentOid: string
    parentsOidList: string[]
    fileObjects: FileObject[]
    commits: CommitResult[]
    commitSourceBranch: string
  }
}

export type RepoCoreActions = {
  updateRepoName: (name: string) => Promise<void>
  updateRepoDescription: (description: string) => Promise<void>
  updateRepoDeploymentBranch: (deploymentBranch: string) => Promise<void>
  addContributor: (address: string) => Promise<void>
  addDeployment: (deployment: Omit<Deployment, 'deployedBy' | 'branch' | 'timestamp'>) => Promise<void>
  fetchAndLoadRepository: (id: string, branchName?: string) => Promise<string>
  fetchAndLoadParentRepository: (repo: Repo) => Promise<void>
  fetchAndLoadForkRepository: (id: string) => Promise<void>
  loadFilesFromRepo: () => Promise<void>
  setRepoContributionStats: (data: UserContributionData) => void
  isRepoOwner: () => boolean
  isContributor: () => boolean
  reset: () => void
  git: {
    readFilesFromOid: (oid: string) => Promise<void>
    readFileContentFromOid: (oid: string) => Promise<Uint8Array | null>
    setCurrentOid: (oid: string) => void
    setRootOid: (oid: string) => void
    pushParentOid: (oid: string) => void
    popParentOid: () => string
    goBack: () => Promise<void>
    downloadRepository: () => Promise<null | undefined>
    setCommits: (commits: CommitResult[]) => void
  }
}

export type FileObject = {
  prefix: string
  oid: string
  path: string
  type: string
  parent: string
}

export type ForkRepositoryOptions = {
  name: string
  description: string
  parent: string
  dataTxId: string
}
