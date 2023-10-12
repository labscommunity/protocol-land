import React from 'react'
import { FileWithPath } from 'react-dropzone'

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
  const [commitsList, setCommitsList] = React.useState<CommitResult[]>([])

  async function fetchAllCommits(name: string) {
    const fs = fsWithName(name)
    const dir = `/${name}`
    const commits = await getAllCommits({ fs, dir })

    if (commits && commits.length > 0) {
      setCommitsList(commits)
    }
  }

  async function fetchFirstCommit(name: string) {
    const fs = fsWithName(name)
    const dir = `/${name}`
    const commits = await getFirstCommit({ fs, dir })

    if (commits && commits.length > 0) {
      setCommitsList(commits)
    }
  }

  async function addFiles({ files, id, message, name, owner, defaultBranch }: AddFilesOptions) {
    const fs = fsWithName(name)
    const dir = `/${name}`

    const { error: addFilesToFsError } = await withAsync(() => addFilesForCommit({ fs, dir, files }))

    if (addFilesToFsError) throw new Error('Failed to add files to FS')

    const filesPath = files.reduce((acc: string[], curr: FileWithPath) => {
      if (curr.path) {
        curr.path.startsWith('/') ? acc.push(curr.path.substring(1)) : acc.push(curr.path)
      }

      return acc
    }, [])

    const { error: stagingError } = await withAsync(() => stageFilesForCommit({ fs, dir, filesPath }))

    if (stagingError) throw new Error('Failed to stage files')

    const { error: commitError, response: commitSHA } = await withAsync(() => commitFiles({ fs, dir, message, owner }))

    if (commitError || !commitSHA) throw new Error('Failed to commit files')

    const { error, response } = await withAsync(() => postUpdatedRepo({ fs, dir, owner, id }))

    if (error) throw new Error('Failed to update repository')

    const { result: currentBranch } = await getCurrentBranch({ fs, dir })

    if (currentBranch === defaultBranch) {
      const { response: commit } = await withAsync(() => readCommit({ fs, dir, oid: commitSHA }))

      if (commit) {
        await withAsync(() => postCommitStatDataTxToArweave({ repoName: name, commit }))
      }
    }

    return response
  }

  return {
    commitsList,
    fetchAllCommits,
    fetchFirstCommit,
    addFiles
  }
}
