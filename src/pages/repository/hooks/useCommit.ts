import React from 'react'
import { FileWithPath } from 'react-dropzone'

import { withAsync } from '@/helpers/withAsync'
import { addFilesForCommit, commitFiles, getAllCommits, stageFilesForCommit } from '@/lib/git/commit'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { CommitResult } from '@/types/commit'

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

  async function addFiles(name: string, files: FileWithPath[], message: string, owner: string) {
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

    const result = await withAsync(() => commitFiles({ fs, dir, message, owner }))

    return result
  }

  return {
    commitsList,
    fetchAllCommits,
    addFiles
  }
}
