import git from 'isomorphic-git'

import { CommitResult } from '@/types/commit'

import { FSType } from './helpers/fsWithName'

export async function compareBranches({ fs, dir, base, compare }: CompareBranchesOptions) {
  const commits: CommitResult[] = []

  const [firstBaseBranchCommit] = await git.log({ fs, dir, depth: 1, ref: base })
  const [firstCompareBranchCommit] = await git.log({ fs, dir, depth: 1, ref: compare })

  if (!firstBaseBranchCommit || !firstCompareBranchCommit) return commits

  if (firstBaseBranchCommit.oid === firstCompareBranchCommit.oid) return commits

  let currentCommitOid = firstCompareBranchCommit.oid

  while (currentCommitOid !== firstBaseBranchCommit.oid && currentCommitOid !== undefined) {
    const commit = await git.readCommit({ fs, dir, oid: currentCommitOid })
    currentCommitOid = commit.commit.parent[0]

    commits.push(commit)
  }

  return commits
}

type CompareBranchesOptions = {
  fs: FSType
  dir: string
  base: string
  compare: string
}
