import Arweave from 'arweave'
import git, { WORKDIR } from 'isomorphic-git'
import mime from 'mime'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

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

export async function getDeploymentBranchFiles(repo: Repo, currentBranch: string) {
  const fs = fsWithName(repo.id)
  const restoreToPreviousBranch = currentBranch !== repo.deploymentBranch
  const dir = `/${repo.name}`

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

  if (restoreToPreviousBranch) {
    await checkoutBranch({ fs, dir, name: currentBranch })
  }

  return { files, commit: { oid, message } }
}

export async function uploadFiles(files: File[], commit: Commit, repo: Repo) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const manifest: Manifest = {
    manifest: 'arweave/paths',
    version: '0.1.0',
    index: {
      path: 'index.html'
    },
    paths: {}
  }

  const isNextApp = hasNextAppFiles(files)

  await Promise.all(
    files.map(async (file: File) => {
      const filePath = file.path
      const updatedFilePath =
        isNextApp && filePath.endsWith('.html') && filePath !== 'index.html' ? filePath.replace('.html', '') : filePath
      const buffer = await file.getContent()
      const hash = await toHash(buffer)
      const transaction = await arweave.createTransaction({ data: buffer })

      const mimeType = mime.getType(filePath) || 'application/octet-stream'

      transaction.addTag('Content-Type', mimeType)
      transaction.addTag('App-Name', APP_NAME)
      transaction.addTag('App-Version', APP_VERSION)
      transaction.addTag('File-Hash', hash)

      const response = await window.arweaveWallet.dispatch(transaction)
      manifest.paths[updatedFilePath] = { id: response.id }
    })
  )

  const manifestTransaction = await arweave.createTransaction({ data: JSON.stringify(manifest) })
  const unixTimestamp = Math.floor(Date.now() / 1000)
  // Tags for Dragon Deploy
  manifestTransaction.addTag('Content-Type', MANIFEST_CONTENT_TYPE)
  manifestTransaction.addTag('Title', repo.name)
  manifestTransaction.addTag('App-Name', APP_NAME)
  manifestTransaction.addTag('App-Version', APP_VERSION)
  manifestTransaction.addTag('Unix-Time', String(unixTimestamp))
  manifestTransaction.addTag('Description', repo.description)
  manifestTransaction.addTag('Type', 'web-page')
  // Tags for PL
  manifestTransaction.addTag('Deployed-Through', 'Protocol.Land')
  manifestTransaction.addTag('Repo-Id', repo.id)
  manifestTransaction.addTag('Repo-Branch', repo.deploymentBranch)
  manifestTransaction.addTag('Commit-Oid', commit.oid)
  manifestTransaction.addTag('Commit-Message', commit.message)
  const response = await window.arweaveWallet.dispatch(manifestTransaction)
  return response
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

export const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})
