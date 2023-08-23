import git from 'isomorphic-git'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { withAsync } from '@/helpers/withAsync'

import { postUpdatedRepo } from '.'
import { FSType } from './helpers/fsWithName'

export async function getAllBranches({ fs, dir }: CommonBranchOptions) {
  return await git.listBranches({ fs, dir })
}

export async function createNewBranch({ fs, dir, name, repoName, owner, id }: CreateBranchOptions) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const { error: gitBranchError } = await withAsync(() => git.branch({ fs, dir, ref: name, checkout: true }))

  if (gitBranchError) throw new Error('Failed to create new branch.')

  const { error: postRepoError, response: dataTx } = await withAsync(() => postUpdatedRepo({ title: repoName, owner }))

  const { error: listBranchError, response: branchList } = await withAsync(() => git.listBranches({ fs, dir }))

  if (postRepoError || listBranchError) throw new Error('Failed to post updated repo to arweave.')

  if (dataTx && branchList) {
    const interactionData = {
      function: 'createNewBranch',
      payload: {
        id: id,
        newDataTxId: dataTx.id,
        totalBranchCount: branchList.length
      }
    }

    const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

    await contract.writeInteraction(interactionData)

    return {
      result: true
    }
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
