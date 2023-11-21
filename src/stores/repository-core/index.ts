import { StateCreator } from 'zustand'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { withAsync } from '@/helpers/withAsync'
import { addContributor, updateRepoDescription, updateRepoName } from '@/lib/git'

import { CombinedSlices } from '../types'
import {
  getFileContentFromOid,
  getFilesFromOid,
  getOidOfHeadRef,
  getRepositoryMetaFromContract,
  loadRepository,
  saveRepository
} from './actions'
import { ForksMetaData, RepoCoreSlice, RepoCoreState } from './types'

const initialRepoCoreState: RepoCoreState = {
  selectedRepo: {
    status: 'IDLE',
    error: null,
    repo: null,
    statistics: {
      commits: [],
      pullRequests: [],
      issues: []
    },
    forksMetaData: []
  },
  parentRepo: {
    status: 'IDLE',
    error: null,
    repo: null
  },
  forkRepo: {
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
    parentsOidList: [],
    commits: [],
    commitSourceBranch: ''
  }
}

const createRepoCoreSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], RepoCoreSlice> = (
  set,
  get
) => ({
  repoCoreState: initialRepoCoreState,
  repoCoreActions: {
    reset: () => {
      set((state) => {
        state.repoCoreState = initialRepoCoreState
      })
    },
    isRepoOwner: () => {
      const repo = get().repoCoreState.selectedRepo.repo
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        return false
      }

      return repo.owner === userAddress
    },
    isContributor: () => {
      const repo = get().repoCoreState.selectedRepo.repo
      const userAddress = get().authState.address

      if (!repo || !userAddress) {
        return false
      }

      const isRepoOwner = repo.owner === userAddress

      if (isRepoOwner) return true

      const isContributor = repo?.contributors?.indexOf(userAddress) > -1

      return isContributor
    },
    updateRepoName: async (name: string) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => updateRepoName(repo.name, name, repo.id))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.name = name
        })
      }
    },
    updateRepoDescription: async (description: string) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => updateRepoDescription(description, repo.id))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.description = description
        })

        trackGoogleAnalyticsEvent('Repository', 'Update repo description', 'Update description', {
          repo_name: repo.name,
          repo_id: repo.id,
          description,
          result: 'SUCCESS'
        })
      }
    },
    setRepoContributionStats: (data) => {
      set((state) => {
        state.repoCoreState.selectedRepo.statistics = data
      })
    },
    fetchForkMetaData: async () => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const metaData: ForksMetaData[] = []

      for (const forkRepoId of repo.forks) {
        const { response: metaResponse } = await withAsync(() => getRepositoryMetaFromContract(forkRepoId))

        if (metaResponse && metaResponse.result) {
          const { id, name, owner, timestamp } = metaResponse.result

          metaData.push({
            id,
            name,
            owner,
            createdAt: timestamp
          })
        }
      }

      set((state) => {
        state.repoCoreState.selectedRepo.forksMetaData = metaData
      })
    },
    addContributor: async (address: string) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => addContributor(address, repo.id))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.contributors.push(address)
        })

        trackGoogleAnalyticsEvent('Repository', 'Add contributor to a repo', 'Add repo contributor', {
          repo_name: repo.name,
          repo_id: repo.id,
          contributor_address: address,
          result: 'SUCCESS'
        })
      }
    },
    fetchAndLoadRepository: async (id: string) => {
      set((state) => {
        state.repoCoreState.selectedRepo.status = 'PENDING'
      })

      const { error: metaError, response: metaResponse } = await withAsync(() => getRepositoryMetaFromContract(id))

      if (metaError) {
        set((state) => {
          state.repoCoreState.selectedRepo.error = metaError
          state.repoCoreState.selectedRepo.status = 'ERROR'
        })
      }

      if (metaResponse) {
        const { error: repoFetchError, response: repoFetchResponse } = await withAsync(() =>
          loadRepository(metaResponse.result.id, metaResponse.result.name, metaResponse.result.dataTxId)
        )

        if (metaResponse.result.fork) {
          await get().repoCoreActions.fetchAndLoadParentRepository(metaResponse.result.parent!)
        }

        if (repoFetchError) {
          set((state) => {
            state.repoCoreState.selectedRepo.error = repoFetchError
            state.repoCoreState.selectedRepo.status = 'ERROR'
          })
        }

        if (repoFetchResponse) {
          set((state) => {
            state.repoCoreState.selectedRepo.repo = metaResponse.result
            state.repoCoreState.selectedRepo.status = 'SUCCESS'
          })
        }
      }
    },
    fetchAndLoadParentRepository: async (id: string) => {
      set((state) => {
        state.repoCoreState.parentRepo.status = 'PENDING'
      })

      const { error: metaError, response: metaResponse } = await withAsync(() => getRepositoryMetaFromContract(id))

      if (metaError) {
        set((state) => {
          state.repoCoreState.parentRepo.error = metaError
          state.repoCoreState.parentRepo.status = 'ERROR'
        })
      }

      if (metaResponse) {
        const { error: repoFetchError, response: repoFetchResponse } = await withAsync(() =>
          loadRepository(metaResponse.result.id, metaResponse.result.name, metaResponse.result.dataTxId)
        )

        if (repoFetchError) {
          set((state) => {
            state.repoCoreState.parentRepo.error = repoFetchError
            state.repoCoreState.parentRepo.status = 'ERROR'
          })
        }

        if (repoFetchResponse) {
          set((state) => {
            state.repoCoreState.parentRepo.repo = metaResponse.result
            state.repoCoreState.parentRepo.status = 'SUCCESS'
          })
        }
      }
    },
    fetchAndLoadForkRepository: async (id: string) => {
      set((state) => {
        state.repoCoreState.forkRepo.status = 'PENDING'
      })

      const { error: metaError, response: metaResponse } = await withAsync(() => getRepositoryMetaFromContract(id))

      if (metaError) {
        set((state) => {
          state.repoCoreState.forkRepo.error = metaError
          state.repoCoreState.forkRepo.status = 'ERROR'
        })
      }

      if (metaResponse) {
        const { error: repoFetchError, response: repoFetchResponse } = await withAsync(() =>
          loadRepository(metaResponse.result.id, metaResponse.result.name, metaResponse.result.dataTxId)
        )

        if (repoFetchError) {
          set((state) => {
            state.repoCoreState.forkRepo.error = repoFetchError
            state.repoCoreState.forkRepo.status = 'ERROR'
          })
        }

        if (repoFetchResponse) {
          set((state) => {
            state.repoCoreState.forkRepo.repo = metaResponse.result
            state.repoCoreState.forkRepo.status = 'SUCCESS'
          })
        }
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
      const { error, response } = await withAsync(() => getOidOfHeadRef(repo.id, repoName))

      if (error) {
        set((state) => {
          state.repoCoreState.git.status = 'ERROR'
          state.repoCoreState.git.error = error
        })

        return
      }

      if (response) {
        await get().repoCoreActions.git.readFilesFromOid(response)

        set((state) => {
          state.repoCoreState.git.rootOid = response
          state.repoCoreState.git.currentOid = response
          state.repoCoreState.git.status = 'SUCCESS'
        })
      }
    },
    git: {
      setCommits: (commits) => {
        set((state) => {
          state.repoCoreState.git.commits = commits
          state.repoCoreState.git.commitSourceBranch = state.branchState.currentBranch
        })
      },
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
        const { error, response } = await withAsync(() => getFilesFromOid(repo.id, oid, repoName))

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
        const { error, response } = await withAsync(() => getFileContentFromOid(repo.id, oid, repoName))

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

        const { error } = await withAsync(() => saveRepository(repo.id, repoName))

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
        let currentOid = ''

        set((state) => {
          const poppedOid = state.repoCoreState.git.parentsOidList.pop()

          state.repoCoreState.git.currentOid = poppedOid || ''
          currentOid = poppedOid || ''
        })

        if (currentOid) {
          await get().repoCoreActions.git.readFilesFromOid(currentOid)
        }
      }
    }
  }
})

export default createRepoCoreSlice
