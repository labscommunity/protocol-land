import { Repo } from '@/types/repository'

export interface RepoCoreSlice {
  repoCoreState: RepoCoreState
  repoCoreActions: RepoCoreActions
}

export type RepoCoreState = {
  selectedRepo: {
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
  }
}

export type RepoCoreActions = {
  updateRepoName: (name: string) => Promise<void>
  updateRepoDescription: (description: string) => Promise<void>
  fetchAndLoadRepository: (id: string) => Promise<void>
  loadFilesFromRepo: () => Promise<void>
  git: {
    readFilesFromOid: (oid: string) => Promise<void>
    readFileContentFromOid: (oid: string) => Promise<Uint8Array | null>
    setCurrentOid: (oid: string) => void
    setRootOid: (oid: string) => void
    pushParentOid: (oid: string) => void
    popParentOid: () => string
    goBack: () => Promise<void>
    downloadRepository: () => Promise<null | undefined>
  }
}

export type FileObject = {
  prefix: string
  oid: string
  path: string
  type: string
  parent: string
}
