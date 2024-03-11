import ArDB from 'ardb'
import Arweave from 'arweave'
import { Tag } from 'arweave/web/lib/transaction'
import git, { WORKDIR } from 'isomorphic-git'
import mime from 'mime'
import type { Dispatch, SetStateAction } from 'react'

import { getSigner } from '@/helpers/wallet/getSigner'
import { signAndSendTx } from '@/helpers/wallet/signAndSend'
import { checkoutBranch } from '@/lib/git/branch'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { Repo } from '@/types/repository'

export const APP_NAME = 'Dragon-Deploy'
export const APP_VERSION = '0.3.0'
export const MANIFEST_CONTENT_TYPE = 'application/x.arweave-manifest+json'

export interface File {
  type: 'blob'
  path: string
  size: number // bytes
  hash?: string
  getContent: () => Promise<Uint8Array>
}

export interface Commit {
  oid: string
  message: string
}

export interface Manifest {
  manifest: string
  version: string
  index: { path: string }
  paths: { [key: string]: { [id: string]: string } }
}

export const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})

const ardb = new ArDB(arweave)

function getValueFromTags(tags: Array<{ name: string; value: string }>, name: string) {
  const tag = tags.find((tag) => tag.name === name)
  return tag?.value ?? ''
}

export function uint8ArrayToString(data: Uint8Array) {
  return new TextDecoder('utf-8').decode(data)
}

export function stringToUint8Array(data: string) {
  return new TextEncoder().encode(data)
}

export async function updateFileContent(file: File) {
  if (!file.path.endsWith('.html')) {
    return file
  }
  try {
    let content = uint8ArrayToString(await file.getContent())
    if (
      /src=["'](?!\/\/)(\/.*?\.[^\/"']*?)["']/g.test(content) ||
      /href=["'](?!\/\/)(\/.*?\.[^\/"']*?)["']/g.test(content)
    ) {
      content = content
        .replace(/src=["'](?!\/\/)(\/.*?\.[^\/"']*?)["']/g, 'src=".$1"')
        .replace(/href=["'](?!\/\/)(\/.*?\.[^\/"']*?)["']/g, 'href=".$1"')

      file.getContent = () => Promise.resolve(stringToUint8Array(content))
      return file
    }
  } catch (err) {
    //
  }
  return file
}

export async function getHashToTxId(files: File[]) {
  const hashToTxId: { [key: string]: string } = {}
  try {
    const hashes = files.map((file) => file.hash) as string[]
    const txs = await ardb
      .appName(APP_NAME)
      .search('transactions')
      .only(['id', 'tags'])
      .tags([{ name: 'File-Hash', values: hashes }])
      .findAll()
    txs.forEach((tx: { id: string }) => {
      const hash = getValueFromTags((tx as any)._tags, 'File-Hash')
      hashToTxId[hash] = tx.id
    })
  } catch (error) {
    //
  }
  return hashToTxId
}

export async function getDeploymentBranchFiles(repo: Repo, currentBranch: string) {
  const fs = fsWithName(repo.id)
  const restoreToPreviousBranch = currentBranch !== repo.deploymentBranch
  const dir = `/${repo.id}`

  if (restoreToPreviousBranch) {
    await checkoutBranch({ fs, dir, name: repo.deploymentBranch })
  }

  const {
    oid,
    commit: { message }
  } = (await git.log({ fs, dir, ref: repo.deploymentBranch, depth: 1 }))[0]

  const entries = (await git.walk({ fs, dir, trees: [WORKDIR()] })).flat()

  const files = (
    await Promise.all(
      entries.map(async (entry: any) => ({
        type: await entry.type(),
        path: entry._fullpath,
        size: (await entry.stat()).size,
        getContent: () => entry.content()
      }))
    )
  ).filter((entry) => entry.type === 'blob' && !entry.path.startsWith('.git/'))

  return { files, commit: { oid, message }, branchToRestore: restoreToPreviousBranch ? currentBranch : '' }
}

export async function uploadFiles(
  files: File[],
  commit: Commit,
  repo: Repo,
  branchToRestore: string,
  setUploadPercent: Dispatch<SetStateAction<number>>
) {
  const userSigner = await getSigner()

  const manifest: Manifest = {
    manifest: 'arweave/paths',
    version: '0.1.0',
    index: {
      path: 'index.html'
    },
    paths: {}
  }

  files = await Promise.all(
    files.map(async (file) => {
      // file = await updateFileContent(file) // TODO: Finalize whether to use this
      const hash = await toHash(await file.getContent())
      file.hash = hash
      return file
    })
  )

  const isNextApp = hasNextAppFiles(files)
  const hashToTxId = await getHashToTxId(files)
  const incrementValue = 100 / (files.length + 1)

  await Promise.all(
    files.map(async (file: File) => {
      const filePath = file.path
      const updatedFilePath =
        isNextApp && filePath.endsWith('.html') && filePath !== 'index.html' ? filePath.replace('.html', '') : filePath
      const data = await file.getContent()
      const hash = file.hash!
      const txId = hashToTxId[hash]
      if (txId) {
        manifest.paths[updatedFilePath] = { id: txId }
      } else {
        const mimeType = mime.getType(filePath) || 'application/octet-stream'

        const transactionTags = [
          { name: 'Content-Type', value: mimeType },
          { name: 'App-Name', value: APP_NAME },
          { name: 'App-Version', value: APP_VERSION },
          { name: 'File-Hash', value: hash }
        ] as Tag[]

        const response = await signAndSendTx(data, transactionTags, userSigner, true)
        manifest.paths[updatedFilePath] = { id: response }
        setUploadPercent((uploadPercent: number) => parseFloat((uploadPercent + incrementValue).toFixed(2)))
      }
    })
  )

  const unixTimestamp = Math.floor(Date.now() / 1000)
  const manifestTags = [
    // Tags for Dragon Deploy
    { name: 'Content-Type', value: MANIFEST_CONTENT_TYPE },
    { name: 'Title', value: repo.name },
    { name: 'App-Name', value: APP_NAME },
    { name: 'App-Version', value: APP_VERSION },
    { name: 'Unix-Time', value: String(unixTimestamp) },
    { name: 'Description', value: repo.description },
    { name: 'Type', value: 'web-page' },
    // Tags for PL
    { name: 'Deployed-Through', value: 'Protocol.Land' },
    { name: 'Repo-Id', value: repo.id },
    { name: 'Repo-Branch', value: repo.deploymentBranch },
    { name: 'Commit-Oid', value: commit.oid },
    { name: 'Commit-Message', value: commit.message }
  ] as Tag[]

  const response = await await signAndSendTx(JSON.stringify(manifest), manifestTags, userSigner)
  setUploadPercent(100)

  await restoreBranch(repo, branchToRestore)

  return response
}

export async function restoreBranch(repo: Repo, branchName: string) {
  if (repo && branchName) {
    await checkoutBranch({ fs: fsWithName(repo.id), dir: `/${repo.name}`, name: branchName })
  }
}

export async function toHash(data: BufferSource) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export function getFolderSizeInBytes(files: File[]) {
  let folderSize = 0
  for (const file of files) {
    if (file.size > 100000) {
      folderSize += file.size
    }
  }
  return folderSize
}

export const hasNextAppFiles = (files: File[]) => files.some((file) => /_next[\\/]/.test(file.path))

export const hasIndexFile = (files: File[]) => files.some((file) => file.path === 'index.html')
