import React from 'react'
import { FileWithPath } from 'react-dropzone'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { withAsync } from '@/helpers/withAsync'
import { postUpdatedRepo } from '@/lib/git'
import { getCurrentBranch } from '@/lib/git/branch'
import {
  addFilesForCommit,
  commitFiles,
  getAllCommits,
  getFirstCommit,
  readCommit,
  stageFilesForCommit
} from '@/lib/git/commit'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { postCommitStatDataTxToArweave } from '@/lib/user'
import { useGlobalStore } from '@/stores/globalStore'
import { CommitResult } from '@/types/commit'

type AddFilesOptions = {
  name: string
  files: FileWithPath[]
  message: string
  owner: string
  id: string
  defaultBranch: string
}

export default function useCommit() {
  const [selectedRepo, repoCommitsG, setRepoCommitsG] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo,
    state.repoCoreState.git.commits,
    state.repoCoreActions.git.setCommits
  ])
  const [commitsList, setCommitsList] = React.useState<CommitResult[]>([])

  async function fetchAllCommits(id: string) {
    const fs = fsWithName(id)
    const dir = `/${id}`
    const commits = await getAllCommits({ fs, dir })

    if (commits && commits.length > 0) {
      setCommitsList(commits)
      setRepoCommitsG(commits)
    }
  }

  async function fetchFirstCommit(id: string) {
    const fs = fsWithName(id)
    const dir = `/${id}`
    const commits = await getFirstCommit({ fs, dir })

    if (commits && commits.length > 0) {
      setCommitsList(commits)
      setRepoCommitsG(commits)
    }
  }

  async function addFiles({ files, id, message, name, owner, defaultBranch }: AddFilesOptions) {
    const fs = fsWithName(id)
    const dir = `/${id}`

    const { error: addFilesToFsError } = await withAsync(() => addFilesForCommit({ fs, dir, files }))

    if (addFilesToFsError) throw trackAndThrowError('Failed to add files to FS', name, id)

    const filesPath = files.reduce((acc: string[], curr: FileWithPath) => {
      if (curr.path) {
        curr.path.startsWith('/') ? acc.push(curr.path.substring(1)) : acc.push(curr.path)
      }

      return acc
    }, [])

    const { error: stagingError } = await withAsync(() => stageFilesForCommit({ fs, dir, filesPath }))

    if (stagingError) throw trackAndThrowError('Failed to stage files', name, id)

    const { error: commitError, response: commitSHA } = await withAsync(() => commitFiles({ fs, dir, message, owner }))

    if (commitError || !commitSHA) throw trackAndThrowError('Failed to commit files', name, id)

    const isPrivate = selectedRepo.repo?.private || false
    const privateStateTxId = selectedRepo.repo?.privateStateTxId
    const { error, response } = await withAsync(() => postUpdatedRepo({ fs, dir, owner, id, isPrivate, privateStateTxId }))

    if (error) throw trackAndThrowError('Failed to update repository', name, id)

    if (response) {
      trackGoogleAnalyticsEvent('Repository', 'Add files to repo', 'Add files', {
        repo_name: name,
        repo_id: id,
        result: 'SUCCESS'
      })
    }

    const { result: currentBranch } = await getCurrentBranch({ fs, dir })

    if (currentBranch === defaultBranch) {
      const { response: commit } = await withAsync(() => readCommit({ fs, dir, oid: commitSHA }))

      if (commit) {
        await withAsync(() => postCommitStatDataTxToArweave({ repoName: name, commit }))
      }
    }

    await fetchFirstCommit(id)

    return response
  }

  function trackAndThrowError(message: string, name: string, id: string) {
    trackGoogleAnalyticsEvent('Repository', 'Add files to repo', 'Add files', {
      repo_name: name,
      repo_id: id,
      result: 'FAILED',
      error: message
    })

    return new Error(message)
  }

  return {
    repoCommitsG,
    commitsList,
    setRepoCommitsG,
    fetchAllCommits,
    fetchFirstCommit,
    addFiles
  }
}
