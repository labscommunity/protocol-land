import { StateCreator } from 'zustand'

import { withAsync } from '@/helpers/withAsync'

import { CombinedSlices } from '../types'
import {
  getFileContentFromOid,
  getFilesFromOid,
  getOidOfHeadRef,
  getRepositoryMetaFromContract,
  saveRepository
} from './actions'
import { RepoCoreSlice, RepoCoreState } from './types'

const initialRepoCoreState: RepoCoreState = {
  selectedRepo: {
    status: 'IDLE',
    error: null,
    repo: null
  },
  git: {
    status: 'IDLE',
    error: null,
    rootOid: '',
    currentOid: '',
    fileObjects: [],
    parentsOidList: []
  }
}

const createRepoCoreSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], RepoCoreSlice> = (
  set,
  get
) => ({
  repoCoreState: initialRepoCoreState,
  repoCoreActions: {
    fetchRepoMetadata: async (id: string) => {
      set((state) => {
        state.repoCoreState.selectedRepo.status = 'PENDING'
      })

      const { error, response } = await getRepositoryMetaFromContract(id)

      if (error) {
        set((state) => {
          state.repoCoreState.selectedRepo.error = error
          state.repoCoreState.selectedRepo.status = 'ERROR'
        })
      }

      if (response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo = response.result
          state.repoCoreState.selectedRepo.status = 'SUCCESS'
        })
      }
    },
    loadFilesFromRepo: async () => {
      set((state) => {
        state.repoCoreState.git.status = 'PENDING'
      })

      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const repoName = repo.name
      const { error, response } = await withAsync(() => getOidOfHeadRef(repoName))

      if (error) {
        set((state) => {
          state.repoCoreState.git.status = 'ERROR'
          state.repoCoreState.git.error = error
        })

        return
      }

      if (response) {
        set((state) => {
          state.repoCoreState.git.rootOid = response
          state.repoCoreState.git.currentOid = response
          state.repoCoreState.git.status = 'SUCCESS'
        })
      }
    },
    git: {
      setCurrentOid: (oid) => {
        set((state) => {
          state.repoCoreState.git.currentOid = oid
        })
      },
      setRootOid: (oid) => {
        set((state) => {
          state.repoCoreState.git.rootOid = oid
        })
      },
      readFilesFromOid: async (oid) => {
        const repo = get().repoCoreState.selectedRepo.repo
        const status = get().repoCoreState.selectedRepo.status

        if (status !== 'PENDING') {
          set((state) => {
            state.repoCoreState.git.status = 'PENDING'
          })
        }

        if (!repo) {
          set((state) => (state.repoCoreState.git.status = 'ERROR'))

          return
        }

        const repoName = repo.name
        const { error, response } = await withAsync(() => getFilesFromOid(oid, repoName))

        if (error) {
          set((state) => {
            state.repoCoreState.git.status = 'ERROR'
            state.repoCoreState.git.error = error
          })

          return
        }

        if (response) {
          const { objects } = response

          set((state) => {
            state.repoCoreState.git.fileObjects = objects
            state.repoCoreState.git.status = 'SUCCESS'
          })
        }
      },
      readFileContentFromOid: async (oid) => {
        const repo = get().repoCoreState.selectedRepo.repo

        if (!repo) {
          set((state) => (state.repoCoreState.git.status = 'ERROR'))

          return null
        }

        const repoName = repo.name
        const { error, response } = await withAsync(() => getFileContentFromOid(oid, repoName))

        if (error) {
          set((state) => {
            state.repoCoreState.git.status = 'ERROR'
            state.repoCoreState.git.error = error
          })

          return null
        }

        return response
      },
      downloadRepository: async () => {
        const repo = get().repoCoreState.selectedRepo.repo

        if (!repo) {
          set((state) => (state.repoCoreState.git.status = 'ERROR'))

          return null
        }

        const repoName = repo.name

        const { error } = await withAsync(() => saveRepository(repoName))

        if (error) {
          set((state) => {
            state.repoCoreState.git.status = 'ERROR'
            state.repoCoreState.git.error = error
          })

          return null
        }
      },
      popParentOid: () => {
        const newParentsOidList = get().repoCoreState.git.parentsOidList || []
        const poppedOid = newParentsOidList.pop() || ''

        set((state) => {
          state.repoCoreState.git.parentsOidList = newParentsOidList
        })

        return poppedOid
      },
      pushParentOid: (oid) => {
        set((state) => {
          state.repoCoreState.git.parentsOidList.push(oid)
        })
      },
      goBack: async () => {
        set((state) => {
          const poppedOid = state.repoCoreState.git.parentsOidList.pop()

          state.repoCoreState.git.currentOid = poppedOid || ''
        })
      }
    }
  }
})

export default createRepoCoreSlice
