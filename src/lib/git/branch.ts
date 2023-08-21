import git from 'isomorphic-git'

import { withAsync } from '@/helpers/withAsync'

import { FSType } from './helpers/fsWithName'

export async function getAllBranches({ fs, dir }: CommonBranchOptions) {
  return await git.listBranches({ fs, dir })
}

export async function createNewBranch({ fs, dir, name }: CreateBranchOptions) {
  const { error } = await withAsync(() => git.branch({ fs, dir, ref: name }))

  return {
    error,
    result: !error
  }
}

export async function getCurrentBranch({ fs, dir }: CommonBranchOptions) {
  const { error, response } = await withAsync(() =>
    git.currentBranch({
      fs,
      dir,
      fullname: false
    })
  )

  return {
    error,
    result: response
  }
}

type CreateBranchOptions = CommonBranchOptions & {
  name: string
}

type CommonBranchOptions = {
  fs: FSType
  dir: string
}
