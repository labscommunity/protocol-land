import Arweave from 'arweave'
import toast from 'react-hot-toast'

import { getRepoSize } from '@/helpers/getArrayBufSize'
import { waitFor } from '@/helpers/waitFor'
import { getActivePublicKey } from '@/helpers/wallet/getPublicKey'
import { withAsync } from '@/helpers/withAsync'
import { ArFSSingleton } from '@/lib/arfs/arfsSingleton'
import arfsSingletonMap from '@/lib/arfs/arfsSingletonMap'
import { getArFS } from '@/lib/arfs/getArFS'
import { getBifrost } from '@/lib/arfs/getBifrost'
import { unmountRepoFromBrowser } from '@/lib/git'
import { getAllCommits } from '@/lib/git/commit'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { getOidFromRef, readFileFromOid, readFilesFromOid } from '@/lib/git/helpers/oid'
import { packGitRepo } from '@/lib/git/helpers/zipUtils'
import { decryptAesKeyWithPrivateKey, decryptFileWithAesGcm } from '@/lib/private-repos/crypto/decrypt'
import { deriveAddress } from '@/lib/private-repos/utils'
import { PrivateState } from '@/types/repository'

export async function getOidOfHeadRef(id: string) {
  const fs = fsWithName(id)
  const dir = `/${id}`

  return getOidFromRef({ ref: 'HEAD', dir, fs })
}

export async function getFilesFromOid(id: string, oid: string, prefix: string) {
  const fs = fsWithName(id)
  const dir = `/${id}`

  return readFilesFromOid({ dir, oid, prefix, fs })
}

export async function getFileContentFromOid(id: string, oid: string) {
  const fs = fsWithName(id)
  const dir = `/${id}`

  return readFileFromOid({ dir, oid, fs })
}

export async function saveRepository(id: string, name: string) {
  const fs = fsWithName(id)
  const dir = `/${id}`

  const blob = await packGitRepo({ fs, dir })

  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = `${name}.zip` // Set the desired filename for the ZIP file
  downloadLink.style.display = 'none'
  document.body.appendChild(downloadLink)

  // Simulate a click on the download link
  downloadLink.click()

  // Clean up the temporary URL object
  URL.revokeObjectURL(downloadLink.href)

  // Remove the download link from the DOM
  document.body.removeChild(downloadLink)
}

export async function loadRepository(id: string) {
  const arfs = getArFS()

  const drive = await arfs.drive.get(id)

  const bifrost = getBifrost(drive!, arfs)
  await bifrost.buildDriveState()
  await waitFor(500)

  await bifrost.syncDrive()

  const arfsSingleton = new ArFSSingleton()

  arfsSingleton.setArFS(arfs)
  arfsSingleton.setDrive(drive!)
  arfsSingleton.setBifrost(bifrost)

  arfsSingletonMap.setArFSSingleton(id, arfsSingleton)

  let repoSize = 0

  if (bifrost.driveState) {
    for (const entry in bifrost.driveState) {
      const entity = bifrost.driveState[entry]

      if (entity.entityType === 'folder' || !entity.size) continue

      repoSize += entity.size
    }
  }

  return { success: true, repoSize: getRepoSize(repoSize) }
}

export async function renameRepoDir(id: string, currentName: string, newName: string) {
  if (currentName === newName) return true

  const fs = fsWithName(id)
  const currentDir = `/${currentName}`
  const newDir = `/${newName}`

  const { error: readError } = await withAsync(() => fs.promises.readdir(newDir))

  if (!readError) return true

  const { error } = await withAsync(() => fs.promises.rename(currentDir, newDir))

  if (!error) return true

  return false
}

export async function unmountRepository(id: string) {
  return unmountRepoFromBrowser(id)
}

export async function decryptRepo(repoArrayBuf: ArrayBuffer, privateStateTxId: string): Promise<ArrayBuffer> {
  const arweave = new Arweave({
    host: 'ar-io.net',
    port: 443,
    protocol: 'https'
  })

  const response = await fetch(`https://arweave.net/${privateStateTxId}`)
  const privateState = (await response.json()) as PrivateState

  const ivArrBuff = arweave.utils.b64UrlToBuffer(privateState.iv)

  //public key -> hash -> get the aes key from object
  const pubKey = await getActivePublicKey()
  const address = await deriveAddress(pubKey)

  const encAesKeyStr = privateState.encKeys[address]
  const encAesKeyBuf = arweave.utils.b64UrlToBuffer(encAesKeyStr)

  const aesKey = (await decryptAesKeyWithPrivateKey(encAesKeyBuf)) as unknown as ArrayBuffer
  const decryptedRepo = await decryptFileWithAesGcm(repoArrayBuf, aesKey, ivArrBuff)

  return decryptedRepo
}

export async function decryptPAT(encryptedPATString: string, privateStateTxId: string): Promise<string> {
  const arweave = new Arweave({
    host: 'ar-io.net',
    port: 443,
    protocol: 'https'
  })

  const encryptedPAT = arweave.utils.b64UrlToBuffer(encryptedPATString)
  const response = await fetch(`https://arweave.net/${privateStateTxId}`)
  const privateState = (await response.json()) as PrivateState
  const ivArrBuff = arweave.utils.b64UrlToBuffer(privateState.iv)

  //public key -> hash -> get the aes key from object
  const pubKey = await getActivePublicKey()
  const address = await deriveAddress(pubKey)

  const encAesKeyStr = privateState.encKeys[address]
  const encAesKeyBuf = arweave.utils.b64UrlToBuffer(encAesKeyStr)

  const aesKey = (await decryptAesKeyWithPrivateKey(encAesKeyBuf)) as unknown as ArrayBuffer
  const accessToken = await decryptFileWithAesGcm(encryptedPAT, aesKey, ivArrBuff)

  return new TextDecoder().decode(accessToken)
}

export async function countCommits(id: string) {
  const fs = fsWithName(id)
  const dir = `/${id}`

  for (let attempt = 0; attempt < 3; attempt++) {
    const { response, error } = await withAsync(() => getAllCommits({ fs, dir }))
    if (response && !error) {
      return response.length
    } else {
      console.warn(`Failed to fetch commits (attempt ${attempt + 1} / 3). Retrying...`)
      continue
    }
  }

  toast.error('Failed to count commits from repo. Refresh the page and try again.')

  return 0
}
