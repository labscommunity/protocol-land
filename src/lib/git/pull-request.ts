import git from 'isomorphic-git'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'

import { FSType } from './helpers/fsWithName'

export async function compareBranches({ fs, dir, base, compare }: CompareBranchesOptions) {
  const baseCommits = await git.log({ fs, dir, ref: base })
  const compareCommits = await git.log({ fs, dir, ref: compare })

  const filteredCommits = compareCommits.filter((compareCommit) => {
    return !baseCommits.some((baseCommit) => baseCommit.oid === compareCommit.oid)
  })

  return filteredCommits
}

export async function postNewPullRequest({ title, description, baseBranch, compareBranch, repoId }: PostNewPROptions) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'createPullRequest',
    payload: {
      title,
      description,
      repoId,
      baseBranch,
      compareBranch
    }
  })

  const {
    cachedValue: {
      state: { repos }
    }
  } = await contract.readState()

  const repo = repos[repoId]

  if (!repo) return

  const PRs = repo.pullRequests
  const PR = PRs[PRs.length - 1]

  if (!PR) return

  return PR
}

type PostNewPROptions = {
  title: string
  description: string
  baseBranch: string
  compareBranch: string
  repoId: string
}

type CompareBranchesOptions = {
  fs: FSType
  dir: string
  base: string
  compare: string
}
