import git from 'isomorphic-git'
import { FileWithPath } from 'react-dropzone'

import { toArrayBuffer } from '@/helpers/toArrayBuffer'
import { useGlobalStore } from '@/stores/globalStore'

import { FSType } from './helpers/fsWithName'

export async function getAllCommits({ fs, dir }: CommonCommitOptions) {
  return await git.log({ fs, dir })
}

export async function getFirstCommit({ fs, dir }: CommonCommitOptions) {
  return await git.log({ fs, dir, depth: 1 })
}

export async function addFilesForCommit({ fs, dir, files }: AddFilesForCommitOptions) {
  for (const file of files) {
    const paths = file.path?.split('/') || []

    if (paths.length > 1) {
      let currentPath = ''

      for (let i = 1; i < paths.length; i++) {
        const path = paths[i]
        const isLastItem = i === paths.length - 1

        if (!isLastItem) {
          try {
            currentPath = currentPath.length > 0 ? `${currentPath}/${path}` : path

            await fs.promises.mkdir(`${dir}/${currentPath}`)
          } catch (error) {
            continue
          }
        } else {
          const fileBuffer = (await toArrayBuffer(file)) as ArrayBuffer
          const filePath = `${dir}${file?.path || ''}`

          await fs.promises.writeFile(filePath, new Uint8Array(fileBuffer))
        }
      }
    } else {
      const fileBuffer = (await toArrayBuffer(file)) as ArrayBuffer

      await fs.promises.writeFile(`${dir}/${file.path!}`, new Uint8Array(fileBuffer))
    }
  }
}

export async function stageFilesForCommit({ fs, dir, filesPath }: StageFilesForCommitOptions) {
  return git.add({ fs, dir, filepath: filesPath })
}

export async function commitFiles({ fs, dir, message, owner }: CommitFilesOptions) {
  const user = useGlobalStore.getState().userState.allUsers.get(owner)
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: user?.fullname || owner,
      email: user?.email || owner
    },
    message
  })

  if (!sha) return false

  return sha
}

export async function readCommit({ fs, dir, oid }: ReadCommitOptions) {
  const result = await git.readCommit({
    fs,
    dir,
    oid
  })

  if (!result || !result.commit) {
    return null
  }

  return result.commit
}

type CommonCommitOptions = {
  fs: FSType
  dir: string
}

type AddFilesForCommitOptions = CommonCommitOptions & {
  files: FileWithPath[]
}

type StageFilesForCommitOptions = CommonCommitOptions & {
  filesPath: string[]
}

type CommitFilesOptions = CommonCommitOptions & {
  message: string
  owner: string
}

type ReadCommitOptions = CommonCommitOptions & {
  oid: string
}
