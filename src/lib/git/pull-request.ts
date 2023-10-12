import git from 'isomorphic-git'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { waitFor } from '@/helpers/waitFor'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

import { postPRStatDataTxToArweave } from '../user'
import { postUpdatedRepo } from '.'
import { checkoutBranch } from './branch'
import { FSType, fsWithName } from './helpers/fsWithName'

export async function compareBranches({ fs, dir, base, compare }: CompareBranchesOptions) {
  const baseCommits = await git.log({ fs, dir, ref: base })
  const compareCommits = await git.log({ fs, dir, ref: compare })

  const filteredCommits = compareCommits.filter((compareCommit) => {
    return !baseCommits.some((baseCommit) => baseCommit.oid === compareCommit.oid)
  })

  return filteredCommits
}

export async function postNewPullRequest({
  repoName,
  title,
  description,
  baseBranch,
  compareBranch,
  repoId
}: PostNewPROptions) {
  const address = useGlobalStore.getState().authState.address

  const fs = fsWithName(repoName)
  const dir = `/${repoName}`

  const oid = await git.resolveRef({ fs, dir, ref: baseBranch })

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
      compareBranch,
      baseBranchOid: oid
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

  if (!PR || !PR.id) return

  if (address) {
    await postPRStatDataTxToArweave(address, repoName, PR)
  }

  return PR
}

export async function getStatusMatrixOfTwoBranches({ base, compare, fs, dir }: CompareBranchesOptions) {
  const currentBranch = await git.currentBranch({ fs, dir, fullname: false })

  if (currentBranch !== compare) {
    await checkoutBranch({ fs, dir, name: compare })
  }

  const status = await git.statusMatrix({
    fs,
    dir,
    ref: base
  })

  return status.filter((row) => {
    const headStatus = row[1]
    const workDirStatus = row[2]
    const stageStatus = row[3]

    const unmodified = headStatus === 1 && workDirStatus === 1 && stageStatus === 1

    return !unmodified
  })
}

export async function readFileFromRef({ ref, fs, dir, filePath }: ReadFileFromRefOptions) {
  const commitOid = await git.resolveRef({ fs, dir, ref })

  const { blob } = await git.readBlob({
    fs,
    dir,
    oid: commitOid,
    filepath: filePath
  })

  return Buffer.from(blob).toString('utf8')
}

export async function mergePullRequest({
  fs,
  dir,
  base,
  compare,
  author,
  dryRun,
  repoId,
  prId
}: MergePullRequestOptions) {
  const { error } = await withAsync(() =>
    git.merge({
      fs,
      dir,
      ours: base,
      theirs: compare,
      abortOnConflict: true,
      fastForward: false,
      dryRun,
      author: {
        email: author,
        name: author
      }
    })
  )

  await waitFor(500)

  if (!error) {
    await postUpdatedRepo({ fs, dir, owner: author, id: repoId })

    await waitFor(1000)

    const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
    await userSigner.setPublicKey()

    const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

    await contract.writeInteraction({
      function: 'updatePullRequestStatus',
      payload: {
        repoId,
        prId,
        status: 'MERGED'
      }
    })
  }
}

export async function closePullRequest({ repoId, prId }: { repoId: string; prId: number }) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updatePullRequestStatus',
    payload: {
      repoId,
      prId,
      status: 'CLOSED'
    }
  })
}

export async function addReviewersToPR({ reviewers, repoId, prId }: AddReviewersToPROptions) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'addReviewersToPR',
    payload: {
      repoId,
      prId,
      reviewers
    }
  })
}

export async function approvePR({ repoId, prId }: ApprovePROptions) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'approvePR',
    payload: {
      repoId,
      prId
    }
  })
}

type ApprovePROptions = {
  repoId: string
  prId: number
}

type AddReviewersToPROptions = {
  reviewers: string[]
  repoId: string
  prId: number
}

type PostNewPROptions = {
  repoName: string
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

type ReadFileFromRefOptions = {
  fs: FSType
  dir: string
  ref: string
  filePath: string
}

type MergePullRequestOptions = {
  fs: FSType
  dir: string
  base: string
  compare: string
  author: string
  dryRun?: boolean
  repoId: string
  prId: number
}
