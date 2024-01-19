import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { postIssueStatDataTxToArweave } from '@/lib/user'
import { Issue } from '@/types/repository'

async function getContract() {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  return contract
}

async function getIssue(contract: any, repoId: string, issueId: number) {
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

export async function createNewIssue(title: string, description: string, repoId: string, address: string) {
  const contract = await getContract()

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
  const contract = await getContract()

  await contract.writeInteraction({
    function: 'addAssigneeToIssue',
    payload: {
      repoId,
      issueId,
      assignees
    }
  })

  const issue = await getIssue(contract, repoId, issueId)
  return issue
}

export async function addCommentToIssue(repoId: string, issueId: number, comment: string) {
  const contract = await getContract()

  await contract.writeInteraction({
    function: 'addCommentToIssue',
    payload: {
      repoId,
      issueId,
      comment
    }
  })

  const issue = await getIssue(contract, repoId, issueId)
  return issue
}

export async function updateIssueComment(repoId: string, issueId: number, comment: object) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateIssueComment',
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
  const contract = await getContract()

  await contract.writeInteraction({
    function: 'updateIssueStatus',
    payload: {
      repoId,
      issueId,
      status: 'COMPLETED'
    }
  })

  const issue = await getIssue(contract, repoId, issueId)
  return issue
}

export async function reopenIssue(repoId: string, issueId: number) {
  const contract = await getContract()

  await contract.writeInteraction({
    function: 'updateIssueStatus',
    payload: {
      repoId,
      issueId,
      status: 'REOPEN'
    }
  })

  const issue = await getIssue(contract, repoId, issueId)
  return issue
}

export async function updateIssueDetails(repoId: string, issueId: number, issue: Partial<Issue>) {
  const contract = await getContract()

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
  const contract = await getContract()

  await contract.writeInteraction({
    function: 'createNewBounty',
    payload: {
      repoId,
      issueId,
      amount,
      expiry
    }
  })

  const issue = await getIssue(contract, repoId, issueId)
  return issue
}

export async function closeBounty(
  repoId: string,
  issueId: number,
  bountyId: number,
  status: string,
  paymentTxId?: string
) {
  const contract = await getContract()

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

  const issue = await getIssue(contract, repoId, issueId)
  return issue
}
