import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'

export async function createNewIssue(title: string, description: string, repoId: string) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'createIssue',
    payload: {
      title,
      description,
      repoId
    }
  })

  const {
    cachedValue: {
      state: { repos }
    }
  } = await contract.readState()

  const repo = repos[repoId]

  if (!repo) return

  const issues = repo.issues
  const issue = issues[issues.length - 1]

  if (!issue) return

  return issue
}

export async function addAssigneeToIssue(repoId: string, issueId: number, assignees: string[]) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'addAssigneeToIssue',
    payload: {
      repoId,
      issueId,
      assignees
    }
  })
}

export async function addCommentToIssue(repoId: string, issueId: number, comment: string) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'addCommentToIssue',
    payload: {
      repoId,
      issueId,
      comment
    }
  })

  const {
    cachedValue: {
      state: { repos }
    }
  } = await contract.readState()

  const issues = repos[repoId]?.issues

  if (!issues) return

  const issue = issues[issueId - 1]

  if (!issue) return

  return issue
}

export async function closeIssue(repoId: string, issueId: number) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateIssueStatus',
    payload: {
      repoId,
      issueId,
      status: 'COMPLETED'
    }
  })
}

export async function reopenIssue(repoId: string, issueId: number) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateIssueStatus',
    payload: {
      repoId,
      issueId,
      status: 'OPEN'
    }
  })
}
