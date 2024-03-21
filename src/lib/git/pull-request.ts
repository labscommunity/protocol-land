import git, { Errors } from 'isomorphic-git'

import { getTags } from '@/helpers/getTags'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { waitFor } from '@/helpers/waitFor'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'
import { PullRequest } from '@/types/repository'

import { getRepo, sendMessage } from '../contract'
import { postPRStatDataTxToArweave } from '../user'
import { postUpdatedRepo } from '.'
import { checkoutBranch, deleteBranch } from './branch'
import { FSType, fsWithName } from './helpers/fsWithName'

export async function compareBranches({
  baseFS,
  compareFS,
  baseDir,
  compareDir,
  baseBranch,
  compareBranch
}: CompareBranchesOptions) {
  const baseCommits = await git.log({ fs: baseFS, dir: baseDir, ref: baseBranch })
  const compareCommits = await git.log({ fs: compareFS, dir: compareDir, ref: compareBranch })

  const filteredCommits = compareCommits.filter((compareCommit) => {
    return !baseCommits.some((baseCommit) => baseCommit.oid === compareCommit.oid)
  })

  return filteredCommits
}

export async function postNewPullRequest({
  title,
  description,
  baseBranch,
  compareBranch,
  repoId,
  baseRepo,
  compareRepo,
  linkedIssueId
}: PostNewPROptions) {
  const address = useGlobalStore.getState().authState.address

  const baseFS = fsWithName(baseRepo.repoId)
  const baseDir = `/${baseRepo.repoId}`

  const oid = await git.resolveRef({ fs: baseFS, dir: baseDir, ref: baseBranch })

  const args = {
    tags: getTags({
      Action: 'Create-PR',
      Title: title,
      RepoId: repoId,
      BaseBranch: baseBranch,
      CompareBranch: compareBranch,
      BaseBranchOid: oid,
      LinkedIssueId: typeof linkedIssueId === 'number' ? linkedIssueId.toString() : '',
      BaseRepo: JSON.stringify(baseRepo),
      CompareRepo: JSON.stringify(compareRepo)
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

  const PRs = repo.pullRequests
  const PR = PRs[PRs.length - 1]

  if (!PR || !PR.id) return

  if (address) {
    await postPRStatDataTxToArweave(address, baseRepo.repoName, baseRepo.repoId, PR)
  }

  trackGoogleAnalyticsEvent('Repository', 'Successfully create a new PR', 'Create PR', {
    repo_name: baseRepo.repoName,
    repo_id: repoId,
    pr_id: PR.id,
    pr_title: PR.title
  })

  return PR
}

export async function getStatusMatrixOfTwoBranches({ base, compare, fs, dir }: GetStatusMatrixOfTwoBranchesOptions) {
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
  prId,
  fork,
  isPrivate,
  privateStateTxId
}: MergePullRequestOptions) {
  const user = useGlobalStore.getState().userState.allUsers.get(author)
  const { error } = await withAsync(() =>
    git.merge({
      fs,
      dir,
      ours: base,
      theirs: compare,
      abortOnConflict: true,
      dryRun,
      author: {
        email: user?.email || author,
        name: user?.fullname || author
      }
    })
  )

  if (dryRun) {
    if (error && (error instanceof Errors.MergeConflictError || error instanceof Errors.MergeNotSupportedError)) {
      throw error
    }

    return
  }

  await waitFor(500)

  if (error instanceof Errors.MergeNotSupportedError) {
    //
    console.log(
      'Automatic merge failed for the following files: ' +
        `${error.data}. ` +
        'Resolve these conflicts and then commit your changes.'
    )
  }

  if (!error) {
    if (fork) {
      await deleteBranch({ fs, dir, name: compare })
    }
    await postUpdatedRepo({ fs, dir, owner: author, id: repoId, isPrivate, privateStateTxId })

    await waitFor(1000)

    await sendMessage({
      tags: getTags({
        Action: 'Update-PR-Status',
        RepoId: repoId,
        PRId: prId.toString(),
        Status: 'MERGED'
      })
    })

    const repo = await getRepo(repoId)

    const PRs = repo?.pullRequests

    if (!PRs) return

    const PR = PRs[prId - 1]

    if (!PR) return

    return PR
  } else {
    throw error
  }
}

export async function closePullRequest({ repoId, prId }: { repoId: string; prId: number }) {
  await sendMessage({
    tags: getTags({
      Action: 'Update-PR-Status',
      RepoId: repoId,
      PRId: prId.toString(),
      Status: 'CLOSED'
    })
  })

  const repo = await getRepo(repoId)

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function reopenPullRequest({ repoId, prId }: { repoId: string; prId: number }) {
  await sendMessage({
    tags: getTags({
      Action: 'Update-PR-Status',
      RepoId: repoId,
      PRId: prId.toString(),
      Status: 'REOPEN'
    })
  })

  const repo = await getRepo(repoId)

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function updatePullRequestDetails(repoId: string, prId: number, pullRequest: Partial<PullRequest>) {
  let tags = {
    Action: 'Update-PR-Details',
    RepoId: repoId,
    PRId: prId.toString()
  } as any

  let data = ''

  if (!isInvalidInput(pullRequest.title, 'string')) {
    tags = { ...tags, Title: pullRequest.title }
  }

  if (!isInvalidInput(pullRequest.description, 'string', true)) {
    if (pullRequest.description) {
      data = pullRequest.description
    } else {
      tags = { ...tags, Description: pullRequest.description }
    }
  }

  await sendMessage({ tags: getTags(tags), data })
}

export async function addReviewersToPR({ reviewers, repoId, prId }: AddReviewersToPROptions) {
  await sendMessage({
    tags: getTags({
      Action: 'Add-PR-Reviewers',
      RepoId: repoId,
      PRId: prId.toString(),
      Reviewers: JSON.stringify(reviewers)
    })
  })

  const repo = await getRepo(repoId)

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function approvePR({ repoId, prId }: ApprovePROptions) {
  await sendMessage({
    tags: getTags({
      Action: 'Approve-PR',
      RepoId: repoId,
      PRId: prId.toString()
    })
  })

  const repo = await getRepo(repoId)

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function addCommentToPR(repoId: string, prId: number, comment: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Add-PR-Comment',
      RepoId: repoId,
      PRId: prId.toString()
    }),
    data: comment
  })

  const repo = await getRepo(repoId)

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function updatePRComment(repoId: string, prId: number, comment: { id: number; description: string }) {
  await sendMessage({
    tags: getTags({
      Action: 'Update-PR-Comment',
      RepoId: repoId,
      PRId: prId.toString(),
      CommentId: comment.id.toString()
    }),
    data: comment.description
  })

  const repo = await getRepo(repoId)

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function linkIssueToPR(repoId: string, prId: number, issueId: number) {
  await sendMessage({
    tags: getTags({
      Action: 'Link-Issue-PR',
      RepoId: repoId,
      PRId: prId.toString(),
      LinkedIssueId: issueId.toString()
    })
  })

  const repo = await getRepo(repoId)

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
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
  baseRepo: PRSide
  compareRepo: PRSide
  title: string
  description: string
  baseBranch: string
  compareBranch: string
  repoId: string
  linkedIssueId?: number
}

type PRSide = {
  repoName: string
  repoId: string
}

type CompareBranchesOptions = {
  baseFS: FSType
  compareFS: FSType
  baseDir: string
  compareDir: string
  baseBranch: string
  compareBranch: string
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
  fork: boolean
  isPrivate: boolean
  privateStateTxId?: string
}

type GetStatusMatrixOfTwoBranchesOptions = {
  fs: FSType
  dir: string
  base: string
  compare: string
}
