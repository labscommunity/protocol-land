import { checkoutBranch, createNewBranch, getAllBranches, getCurrentBranch } from '@/lib/git/branch'
import { fsWithName } from '@/lib/git/helpers/fsWithName'

export async function getBranchList(name: string) {
  const fs = fsWithName(name)
  const dir = `/${name}`

  return getAllBranches({ fs, dir })
}

export async function getCurrentActiveBranch(name: string) {
  const fs = fsWithName(name)
  const dir = `/${name}`

  return getCurrentBranch({ fs, dir })
}

export async function addNewBranch(repoName: string, branchName: string) {
  const fs = fsWithName(repoName)
  const dir = `/${repoName}`

  return createNewBranch({
    fs,
    dir,
    name: branchName
  })
}

export async function changeBranch(repoName: string, branchName: string) {
  const fs = fsWithName(repoName)
  const dir = `/${repoName}`

  return checkoutBranch({ fs, dir, name: branchName })
}
