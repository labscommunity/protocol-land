import git from 'isomorphic-git'

import { withAsync } from '@/helpers/withAsync'
import { checkoutBranch, createNewBranch, getCurrentBranch } from '@/lib/git/branch'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { createPackFile, indexPackFile, readFilesFromCommit } from '@/lib/git/helpers/oid'
import { compareBranches, getStatusMatrixOfTwoBranches, mergePullRequest } from '@/lib/git/pull-request'
import { CommitResult } from '@/types/commit'

import { PRSideOptions } from '../types'

export async function compareTwoBranches({ base, compare }: PRSideOptions) {
  const baseFS = fsWithName(base.id)
  const compareFS = fsWithName(compare.id)
  const baseDir = `/${base.repoName}`
  const compareDir = `/${compare.repoName}`

  if (base.branch === compare.branch && base.id === compare.id) return []

  return compareBranches({
    baseFS,
    compareFS,
    baseDir,
    compareDir,
    baseBranch: base.branch,
    compareBranch: compare.branch
  })
}

export async function getChangedFiles(id: string, name: string, branchA: string, branchB: string) {
  const fs = fsWithName(id)
  const dir = `/${name}`

  if (branchA === branchB) return []

  return getStatusMatrixOfTwoBranches({ fs, dir, base: branchA, compare: branchB })
}

export async function traverseAndCopyForkObjects(
  id: string,
  name: string,
  commits: CommitResult[],
  targetId: string,
  targetName: string
) {
  const fs = fsWithName(id)
  const targetFs = fsWithName(targetId)
  const dir = `/${name}`
  const targetDir = `/${targetName}`
  const extractedOids = []

  for (const commit of commits) {
    const objects = await readFilesFromCommit({ fs, dir, oid: commit.commit.tree, prefix: '' })

    extractedOids.push(...objects.oids)
    extractedOids.push(objects.parent)
    extractedOids.push(commit.oid)
  }

  const uniqueOidsMap = new Set<string>()
  const oidsToPack: string[] = []

  for (const oid of extractedOids) {
    if (!uniqueOidsMap.has(oid)) {
      uniqueOidsMap.add(oid)
      oidsToPack.push(oid)
    }
  }

  const packResult = await createPackFile({ fs, dir, oids: oidsToPack })

  await createNewBranch({ fs: targetFs, dir: targetDir, name: `tmp-stage` })
  await checkoutBranch({ fs: targetFs, dir: targetDir, name: `tmp-stage` })
  const { result: currentBranch, error: currentBranchError } = await getCurrentBranch({ fs: targetFs, dir: targetDir })

  if (currentBranchError || !currentBranch) {
    throw new Error('failed to create packfile')
  }

  if (currentBranch !== 'tmp-stage') {
    throw new Error('failed to create packfile')
  }

  const { error } = await withAsync(() => targetFs.promises.readdir(`${targetDir}/.git/objects/pack`))

  if (error) {
    await targetFs.promises.mkdir(`${targetDir}/.git/objects/pack`)
  }

  await targetFs.promises.writeFile(`${targetDir}/.git/objects/pack/${packResult.filename}`, packResult.packfile!)

  const targetPackFolderContents = await targetFs.promises.readdir(`${targetDir}/.git/objects/pack`)

  if (targetPackFolderContents.indexOf(packResult.filename) === -1) {
    throw new Error('failed to write packfile')
  }

  const { oids: unpackedOids } = await indexPackFile({
    fs: targetFs,
    dir: targetDir,
    filePath: `.git/objects/pack/${packResult.filename}`
  })

  if (!unpackedOids.length) {
    throw new Error('failed to unpack packfile')
  }

  await git.writeRef({
    fs: targetFs,
    dir: targetDir,
    ref: `refs/heads/tmp-stage`,
    value: commits[0].oid,
    force: true
  })

  await git.writeRef({
    fs: targetFs,
    dir: targetDir,
    ref: `HEAD`,
    value: `refs/heads/tmp-stage`,
    force: true
  })

  // await checkoutBranch({ fs: targetFs, dir: targetDir, name: objects.parent })

  return {
    status: true,
    compareBranch: `tmp-stage`
  }
}

export async function mergePR(
  repoId: string,
  prId: number,
  name: string,
  branchA: string,
  branchB: string,
  author: string,
  fork: boolean = false
) {
  const fs = fsWithName(repoId)
  const dir = `/${name}`

  return mergePullRequest({ fs, dir, base: branchA, compare: branchB, author, prId, repoId, fork })
}
