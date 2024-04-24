import { getTags } from '@/helpers/getTags'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { getRepo, sendMessage } from '@/lib/contract'
import { postIssueStatDataTxToArweave } from '@/lib/user'
import { BountyBase, Issue } from '@/types/repository'

async function getIssue(repoId: string, issueId: number) {
  const repo = await getRepo(repoId)

  const issues = repo?.issues

  if (!issues) return

  const issue = issues[issueId - 1]

  if (!issue) return

  return issue
}

export async function createNewIssue(title: string, description: string, repoId: string, address: string) {
  const args = {
    tags: getTags({
      Action: 'Create-Issue',
      Title: title,
      'Repo-Id': repoId
    })
  } as any

  if (description) {
    args.data = description
  } else {
    args.tags.push({ name: 'Description', value: description || '' })
  }

  await sendMessage(args)

  const repo = await getRepo(repoId)

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
  await sendMessage({
    tags: getTags({
      Action: 'Add-Issue-Assignees',
      'Repo-Id': repoId,
      'Issue-Id': issueId.toString(),
      Assignees: JSON.stringify(assignees)
    })
  })

  const issue = await getIssue(repoId, issueId)
  return issue
}

export async function addCommentToIssue(repoId: string, issueId: number, comment: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Add-Issue-Comment',
      'Repo-Id': repoId,
      'Issue-Id': issueId.toString()
    }),
    data: comment
  })

  const issue = await getIssue(repoId, issueId)
  return issue
}

export async function updateIssueComment(
  repoId: string,
  issueId: number,
  comment: { id: number; description: string }
) {
  await sendMessage({
    tags: getTags({
      Action: 'Update-Issue-Comment',
      'Repo-Id': repoId,
      'Issue-Id': issueId.toString(),
      'Comment-Id': comment.id.toString()
    }),
    data: comment.description
  })

  const repo = await getRepo(repoId)

  const issues = repo?.issues

  if (!issues) return

  const issue = issues[issueId - 1]

  if (!issue) return

  return issue
}

export async function closeIssue(repoId: string, issueId: number) {
  await sendMessage({
    tags: getTags({
      Action: 'Update-Issue-Status',
      'Repo-Id': repoId,
      'Issue-Id': issueId.toString(),
      Status: 'COMPLETED'
    })
  })

  const issue = await getIssue(repoId, issueId)
  return issue
}

export async function reopenIssue(repoId: string, issueId: number) {
  await sendMessage({
    tags: getTags({
      Action: 'Update-Issue-Status',
      'Repo-Id': repoId,
      'Issue-Id': issueId.toString(),
      Status: 'REOPEN'
    })
  })

  const issue = await getIssue(repoId, issueId)
  return issue
}

export async function updateIssueDetails(repoId: string, issueId: number, issue: Partial<Issue>) {
  let tags = {
    Action: 'Update-Issue-Details',
    'Repo-Id': repoId,
    'Issue-Id': issueId.toString()
  } as any

  let data = ''

  if (!isInvalidInput(issue.title, 'string')) {
    tags = { ...tags, Title: issue.title }
  }

  if (!isInvalidInput(issue.description, 'string', true)) {
    if (issue.description) {
      data = issue.description as string
    } else {
      tags = { ...tags, Description: issue.description }
    }
  }

  await sendMessage({ tags: getTags(tags), data })
}

export async function addBounty(repoId: string, issueId: number, amount: number, expiry: number, base: BountyBase) {
  await sendMessage({
    tags: getTags({
      Action: 'Create-Bounty',
      'Repo-Id': repoId,
      'Issue-Id': issueId.toString(),
      Amount: amount.toString(),
      Expiry: expiry.toString(),
      Base: base
    }),
  })


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
    'Repo-Id': repoId,
    'Issue-Id': issueId.toString(),
    'Bounty-Id': bountyId.toString(),
    Status: status
  } as any

  if (paymentTxId) {
    tags['Payment-TxId'] = paymentTxId
  }
  await sendMessage({ tags: getTags(tags) })

  const issue = await getIssue(repoId, issueId)
  return issue
}
