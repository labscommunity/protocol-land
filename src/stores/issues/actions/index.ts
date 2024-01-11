import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { postIssueStatDataTxToArweave } from '@/lib/user'
import { Issue } from '@/types/repository'

export async function createNewIssue(title: string, description: string, repoId: string, address: string) {
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

  if (!issue || !issue.id) return

  try {
    await postIssueStatDataTxToArweave(address, repo.name, issue)
  } catch (error) {
    //silently ignore
  }

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

export async function reopenIssue(repoId: string, issueId: number) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateIssueStatus',
    payload: {
      repoId,
      issueId,
      status: 'REOPEN'
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

export async function updateIssueDetails(repoId: string, issueId: number, issue: Partial<Issue>) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)
  let payload = {
    repoId,
    issueId
  } as any

  if (!isInvalidInput(issue.title, 'string')) {
    payload = { ...payload, title: issue.title }
  }

  if (!isInvalidInput(issue.description, 'string', true)) {
    payload = { ...payload, description: issue.description }
  }

  await contract.writeInteraction({
    function: 'updateIssueDetails',
    payload: payload
  })
}

export async function addBounty(repoId: string, issueId: number, amount: number, expiry: number) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'createNewBounty',
    payload: {
      repoId,
      issueId,
      amount,
      expiry
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

export async function closeBounty(
  repoId: string,
  issueId: number,
  bountyId: number,
  status: string,
  paymentTxId?: string
) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateBounty',
    payload: {
      repoId,
      issueId,
      bountyId,
      status,
      paymentTxId
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
