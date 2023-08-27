import git from 'isomorphic-git'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { withAsync } from '@/helpers/withAsync'

import { FSType } from './helpers/fsWithName'

export async function getAllBranches({ fs, dir }: CommonBranchOptions) {
  return await git.listBranches({ fs, dir })
}

export async function createNewBranch({ fs, dir, name }: CreateBranchOptions) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const { error: gitBranchError } = await withAsync(() => git.branch({ fs, dir, ref: name, checkout: true }))

  if (gitBranchError) throw new Error('Failed to create new branch.')

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
      track: false
    })
  )
}

type CreateBranchOptions = CommonBranchOptions & {
  name: string
  repoName: string
  owner: string
  id: string
}

type CommonBranchOptions = {
  fs: FSType
  dir: string
}
