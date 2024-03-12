import { createDataItemSigner, dryrun, message, result } from '@permaweb/aoconnect'
import git, { Errors } from 'isomorphic-git'

import { AOS_PROCESS_ID } from '@/helpers/constants'
import { extractMessage } from '@/helpers/extractMessage'
import { getTags } from '@/helpers/getTags'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { isInvalidInput } from '@/helpers/isInvalidInput'
import { waitFor } from '@/helpers/waitFor'
import { getSigner } from '@/helpers/wallet/getSigner'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'
import { PullRequest, Repo } from '@/types/repository'

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

  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Create-Pr',
      Title: title,
      Description: description,
      RepoId: repoId,
      BaseBranch: baseBranch,
      CompareBranch: compareBranch,
      BaseBranchOid: oid,
      LinkedIssueId: typeof linkedIssueId === 'number' ? linkedIssueId.toString() : '',
      BaseRepo: JSON.stringify(baseRepo),
      CompareRepo: JSON.stringify(compareRepo)
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

    const messageId = await message({
      process: AOS_PROCESS_ID,
      tags: getTags({
        Action: 'Update-Pr-status',
        RepoId: repoId,
        PrId: prId.toString(),
        Status: 'MERGED'
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
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Pr-status',
      RepoId: repoId,
      PrId: prId.toString(),
      Status: 'CLOSED'
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

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function reopenPullRequest({ repoId, prId }: { repoId: string; prId: number }) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Pr-status',
      RepoId: repoId,
      PrId: prId.toString(),
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

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: repoId
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function updatePullRequestDetails(repoId: string, prId: number, pullRequest: Partial<PullRequest>) {
  let tags = {
    Action: 'Update-Pr-Details',
    RepoId: repoId,
    PrId: prId.toString()
  } as any

  if (!isInvalidInput(pullRequest.title, 'string')) {
    tags = { ...tags, Title: pullRequest.title }
  }

  if (!isInvalidInput(pullRequest.description, 'string', true)) {
    tags = { ...tags, Description: pullRequest.description }
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

export async function addReviewersToPR({ reviewers, repoId, prId }: AddReviewersToPROptions) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Add-Pr-Reviewers',
      RepoId: repoId,
      PrId: prId.toString(),
      Reviewers: JSON.stringify(reviewers)
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

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function approvePR({ repoId, prId }: ApprovePROptions) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Approve-Pr',
      RepoId: repoId,
      PrId: prId.toString()
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

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function addCommentToPR(repoId: string, prId: number, comment: string) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Add-Pr-Comment',
      RepoId: repoId,
      PrId: prId.toString(),
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

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: repoId
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function updatePRComment(repoId: string, prId: number, comment: object) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Pr-Comment',
      RepoId: repoId,
      PrId: prId.toString(),
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

  const PRs = repo?.pullRequests

  if (!PRs) return

  const PR = PRs[prId - 1]

  if (!PR) return

  return PR
}

export async function linkIssueToPR(repoId: string, prId: number, issueId: number) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Link-Issue-Pr',
      RepoId: repoId,
      PrId: prId.toString(),
      LinkedIssueId: issueId.toString()
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
