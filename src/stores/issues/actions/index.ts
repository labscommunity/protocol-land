import { createDataItemSigner, dryrun, message, result } from '@permaweb/aoconnect'

import { AOS_PROCESS_ID } from '@/helpers/constants'
import { extractMessage } from '@/helpers/extractMessage'
import { getTags } from '@/helpers/getTags'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { getSigner } from '@/helpers/wallet/getSigner'
import { postIssueStatDataTxToArweave } from '@/lib/user'
import { BountyBase, Issue, Repo } from '@/types/repository'

async function getIssue(repoId: string, issueId: number) {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: repoId
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  const issues = repo?.issues

  if (!issues) return

  const issue = issues[issueId - 1]

  if (!issue) return

  return issue
}

export async function createNewIssue(title: string, description: string, repoId: string, address: string) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Create-Issue',
      Title: title,
      Description: description,
      RepoId: repoId
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: repoId
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  if (!repo) return

  const issues = repo.issues
  const issue = issues[issues.length - 1]

  if (!issue || !issue.id) return

  try {
    await postIssueStatDataTxToArweave(address, repo.name, repo.id, issue)
  } catch (error) {
    //silently ignore
  }

  return issue
}

export async function addAssigneeToIssue(repoId: string, issueId: number, assignees: string[]) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Add-Issue-Assignees',
      RepoId: repoId,
      IssueId: issueId.toString(),
      Assignees: JSON.stringify(assignees)
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const issue = await getIssue(repoId, issueId)
  return issue
}

export async function addCommentToIssue(repoId: string, issueId: number, comment: string) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Add-Issue-Comment',
      RepoId: repoId,
      IssueId: issueId.toString(),
      Comment: comment
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const issue = await getIssue(repoId, issueId)
  return issue
}

export async function updateIssueComment(repoId: string, issueId: number, comment: object) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Issue-Comment',
      RepoId: repoId,
      IssueId: issueId.toString(),
      Comment: JSON.stringify(comment)
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: repoId
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  const issues = repo?.issues

  if (!issues) return

  const issue = issues[issueId - 1]

  if (!issue) return

  return issue
}

export async function closeIssue(repoId: string, issueId: number) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Issue-Status',
      RepoId: repoId,
      IssueId: issueId.toString(),
      Status: 'COMPLETED'
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const issue = await getIssue(repoId, issueId)
  return issue
}

export async function reopenIssue(repoId: string, issueId: number) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Issue-Status',
      RepoId: repoId,
      IssueId: issueId.toString(),
      Status: 'REOPEN'
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const issue = await getIssue(repoId, issueId)
  return issue
}

export async function updateIssueDetails(repoId: string, issueId: number, issue: Partial<Issue>) {
  let tags = {
    Action: 'Update-Issue-Details',
    RepoId: repoId,
    IssueId: issueId.toString()
  } as any

  if (!isInvalidInput(issue.title, 'string')) {
    tags = { ...tags, Title: issue.title }
  }

  if (!isInvalidInput(issue.description, 'string', true)) {
    tags = { ...tags, Description: issue.description }
  }

  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags(tags),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }
}

export async function addBounty(repoId: string, issueId: number, amount: number, expiry: number, base: BountyBase) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Create-Bounty',
      RepoId: repoId,
      IssueId: issueId.toString(),
      Amount: amount.toString(),
      Expiry: expiry.toString(),
      Base: base
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const issue = await getIssue(repoId, issueId)
  return issue
}

export async function closeBounty(
  repoId: string,
  issueId: number,
  bountyId: number,
  status: string,
  paymentTxId?: string
) {
  const tags = {
    Action: 'Update-Bounty',
    RepoId: repoId,
    IssueId: issueId.toString(),
    BountyId: bountyId.toString(),
    Status: status
  } as any

  if (paymentTxId) {
    tags.PaymentTxId = paymentTxId
  }
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags(tags),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const issue = await getIssue(repoId, issueId)
  return issue
}
