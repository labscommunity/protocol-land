import { StateCreator } from 'zustand'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { withAsync } from '@/helpers/withAsync'
import {
  addDeployment,
  inviteContributor,
  updateRepoDeploymentBranch,
  updateRepoDescription,
  updateRepoName
} from '@/lib/git'
import { Deployment } from '@/types/repository'

import { changeBranch, getCurrentActiveBranch } from '../branch/actions'
import { CombinedSlices } from '../types'
import {
  getFileContentFromOid,
  getFilesFromOid,
  getOidOfHeadRef,
  getRepositoryMetaFromContract,
  loadRepository,
  renameRepoDir,
  saveRepository
} from './actions'
import { RepoCoreSlice, RepoCoreState } from './types'

const initialRepoCoreState: RepoCoreState = {
  selectedRepo: {
    status: 'IDLE',
    error: null,
    repo: null,
    statistics: {
      commits: [],
      pullRequests: [],
      issues: []
    }
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
    updateRepoDeploymentBranch: async (deploymentBranch: string) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => updateRepoDeploymentBranch(deploymentBranch, repo.id))

      if (!error) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.deploymentBranch = deploymentBranch
        })

        trackGoogleAnalyticsEvent('Repository', 'Update default deployment branch', 'Update deployment branch', {
          repo_name: repo.name,
          repo_id: repo.id,
          deploymentBranch,
          result: 'SUCCESS'
        })
      }
    },
    setRepoContributionStats: (data) => {
      set((state) => {
        state.repoCoreState.selectedRepo.statistics = data
      })
    },
    inviteContributor: async (address: string) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error } = await withAsync(() => inviteContributor(address, repo.id))

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
    addDeployment: async (deployment: Omit<Deployment, 'deployedBy' | 'branch' | 'timestamp'>) => {
      const repo = get().repoCoreState.selectedRepo.repo

      if (!repo) {
        set((state) => (state.repoCoreState.git.status = 'ERROR'))

        return
      }

      const { error, response } = await withAsync(() => addDeployment(deployment, repo.id))

      if (!error && response) {
        set((state) => {
          state.repoCoreState.selectedRepo.repo!.deployments.push(response)
        })

        trackGoogleAnalyticsEvent('Repository', 'Add deployment to a repo', 'Add repo deployment', {
          repo_name: repo.name,
          repo_id: repo.id,
          deployment,
          result: 'SUCCESS'
        })
        return response
      }
    },
    fetchAndLoadRepository: async (id: string, branchName?: string) => {
      branchName = branchName || 'master'
      let checkedOutBranch = ''
      try {
        set((state) => {
          state.repoCoreState.selectedRepo.status = 'PENDING'
        })

        const { error: metaError, response: metaResponse } = await withAsync(() => getRepositoryMetaFromContract(id))

        if (metaError || !metaResponse) {
          throw new Error('Error fetching repository meta.')
        }

        const { id: repoId, name, dataTxId, fork, parent, privateStateTxId } = metaResponse.result
        let parentRepoName = null

        if (fork) {
          const { error: parentMetaError, response: parentMetaResponse } = await withAsync(() =>
            getRepositoryMetaFromContract(parent!)
          )

          if (parentMetaError || !parentMetaResponse) {
            throw new Error('Error fetching repository meta.')
          }

          if (name !== parentMetaResponse.result.name) {
            parentRepoName = parentMetaResponse.result.name
          }

          await get().repoCoreActions.fetchAndLoadParentRepository(parentMetaResponse.result)
        }

        const { error: repoFetchError, response: repoFetchResponse } = await withAsync(() =>
          loadRepository(repoId, name, dataTxId, privateStateTxId)
        )

        // Always checkout default master branch if available
        if (!repoFetchError && repoFetchResponse) {
          const { error: branchError, result: currentBranch } = await getCurrentActiveBranch(repoId, name)
          if (!branchError && currentBranch && branchName && currentBranch !== branchName) {
            const { error: changeError } = await changeBranch(repoId, name, branchName)
            checkedOutBranch = changeError ? currentBranch : (branchName as string)
          } else if (!branchError && currentBranch) {
            checkedOutBranch = currentBranch
          }
        }

        if (fork && parentRepoName && name !== parentRepoName) {
          const renamed = await renameRepoDir(repoId, parentRepoName, name)

          if (!renamed) throw new Error('Error loading the repository.')
        }

        if (repoFetchError || !repoFetchResponse) {
          throw new Error('Error loading the repository.')
        }

        set((state) => {
          state.repoCoreState.selectedRepo.repo = metaResponse.result
          state.repoCoreState.selectedRepo.status = 'SUCCESS'
        })
      } catch (error: any) {
        set((state) => {
          state.repoCoreState.selectedRepo.error = error.message
          state.repoCoreState.selectedRepo.status = 'ERROR'
        })
      }
      return checkedOutBranch
    },
    fetchAndLoadParentRepository: async (repo) => {
      set((state) => {
        state.repoCoreState.parentRepo.status = 'PENDING'
      })

      const { error: repoFetchError, response: repoFetchResponse } = await withAsync(() =>
        loadRepository(repo.id, repo.name, repo.dataTxId, repo.privateStateTxId)
      )

      if (repoFetchError) {
        set((state) => {
          state.repoCoreState.parentRepo.error = repoFetchError
          state.repoCoreState.parentRepo.status = 'ERROR'
        })
      }

      if (repoFetchResponse) {
        set((state) => {
          state.repoCoreState.parentRepo.repo = repo
          state.repoCoreState.parentRepo.status = 'SUCCESS'
        })
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
          loadRepository(
            metaResponse.result.id,
            metaResponse.result.name,
            metaResponse.result.dataTxId,
            metaResponse.result.privateStateTxId
          )
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
