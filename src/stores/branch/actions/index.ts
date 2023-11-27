import { checkoutBranch, createNewBranch, getAllBranches, getCurrentBranch } from '@/lib/git/branch'
import { fsWithName } from '@/lib/git/helpers/fsWithName'

export async function getBranchList(id: string, name: string) {
  const fs = fsWithName(id)
  const dir = `/${name}`

  return getAllBranches({ fs, dir })
}

export async function getCurrentActiveBranch(id: string, name: string) {
  const fs = fsWithName(id)
  const dir = `/${name}`

  return getCurrentBranch({ fs, dir })
}

export async function addNewBranch(id: string, repoName: string, branchName: string) {
  const fs = fsWithName(id)
  const dir = `/${repoName}`

  return createNewBranch({
    fs,
    dir,
    name: branchName
  })
}

export async function changeBranch(id: string, repoName: string, branchName: string) {
  const fs = fsWithName(id)
  const dir = `/${repoName}`

  return checkoutBranch({ fs, dir, name: branchName })
}
