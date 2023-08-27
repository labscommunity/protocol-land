import React from 'react'
import { FileWithPath } from 'react-dropzone'

import { withAsync } from '@/helpers/withAsync'
import { postUpdatedRepo } from '@/lib/git'
import { addFilesForCommit, commitFiles, getAllCommits, stageFilesForCommit } from '@/lib/git/commit'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { CommitResult } from '@/types/commit'

type AddFilesOptions = {
  name: string
  files: FileWithPath[]
  message: string
  owner: string
  id: string
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

  async function addFiles({ files, id, message, name, owner }: AddFilesOptions) {
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

    const { error: commitError } = await withAsync(() => commitFiles({ fs, dir, message, owner }))

    if (commitError) throw new Error('Failed to commit files')

    const { error, response } = await withAsync(() => postUpdatedRepo({ fs, dir, owner, id }))

    if (error) throw new Error('Failed to update repository')

    return response
  }

  return {
    commitsList,
    fetchAllCommits,
    addFiles
  }
}
