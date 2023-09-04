import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { compareBranches, getStatusMatrixOfTwoBranches } from '@/lib/git/pull-request'

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
