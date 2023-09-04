import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { compareBranches, getStatusMatrixOfTwoBranches, mergePullRequest } from '@/lib/git/pull-request'

export async function compareTwoBranches(name: string, branchA: string, branchB: string) {
  const fs = fsWithName(name)
  const dir = `/${name}`

  if (branchA === branchB) return []

  return compareBranches({ fs, dir, base: branchA, compare: branchB })
}

export async function getChangedFiles(name: string, branchA: string, branchB: string) {
  const fs = fsWithName(name)
  const dir = `/${name}`

  if (branchA === branchB) return []

  return getStatusMatrixOfTwoBranches({ fs, dir, base: branchA, compare: branchB })
}

export async function mergePR(
  repoId: string,
  prId: number,
  name: string,
  branchA: string,
  branchB: string,
  author: string
) {
  const fs = fsWithName(name)
  const dir = `/${name}`

  return mergePullRequest({ fs, dir, base: branchA, compare: branchB, author, prId, repoId })
}
