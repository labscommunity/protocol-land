import git from '@protocol.land/isomorphic-git'

import { withAsync } from '@/helpers/withAsync'

import { FSType } from './helpers/fsWithName'

export async function getAllBranches({ fs, dir }: CommonBranchOptions) {
  return await git.listBranches({ fs, dir })
}

export async function createNewBranch({ fs, dir, name }: CreateBranchOptions) {
  const { error: gitBranchError } = await withAsync(() => git.branch({ fs, dir, ref: name, checkout: true }))

  if (gitBranchError) {
    if (gitBranchError instanceof git.Errors.InvalidRefNameError) {
      throw new Error('Invalid branch name.')
    } else if (gitBranchError instanceof git.Errors.AlreadyExistsError) {
      throw gitBranchError
    }
    throw new Error('Failed to create new branch.')
  }

  return {
    result: true
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

export async function checkoutBranch({ fs, dir, name }: CommonBranchOptions & { name: string }) {
  return await withAsync(() =>
    git.checkout({
      fs,
      dir,
      ref: name,
      force: true,
      track: false,
      noUpdateHead: true
    })
  )
}

export async function deleteBranch({ fs, dir, name }: CommonBranchOptions & { name: string }) {
  return await withAsync(() =>
    git.deleteBranch({
      fs,
      dir,
      ref: name
    })
  )
}

type CreateBranchOptions = CommonBranchOptions & {
  name: string
}

type CommonBranchOptions = {
  fs: FSType
  dir: string
}
