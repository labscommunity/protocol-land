import Arweave from 'arweave'
import { Tag } from 'arweave/web/lib/transaction'
import Dexie from 'dexie'
import git from 'isomorphic-git'
import { v4 as uuidv4 } from 'uuid'

import { getTags } from '@/helpers/getTags'
import { toArrayBuffer } from '@/helpers/toArrayBuffer'
import { waitFor } from '@/helpers/waitFor'
import { getActivePublicKey } from '@/helpers/wallet/getPublicKey'
import { getSigner } from '@/helpers/wallet/getSigner'
import { signAndSendTx } from '@/helpers/wallet/signAndSend'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'
import { ForkRepositoryOptions } from '@/stores/repository-core/types'
import { Deployment, Domain, PrivateState } from '@/types/repository'

import { getRepo, sendMessage } from '../contract'
import { decryptAesKeyWithPrivateKey } from '../private-repos/crypto/decrypt'
import {
  encryptAesKeyWithPublicKeys,
  encryptDataWithExistingKey,
  encryptFileWithAesGcm
} from '../private-repos/crypto/encrypt'
import { deriveAddress, strToJwkPubKey } from '../private-repos/utils'
import { checkoutBranch, getCurrentBranch } from './branch'
import { FSType } from './helpers/fsWithName'
import { packGitRepo, unpackGitRepo } from './helpers/zipUtils'

const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})

export async function postNewRepo({ id, title, description, file, owner, visibility,tokenProcessId }: any) {
  const userSigner = await getSigner()

  const data = (await toArrayBuffer(file)) as ArrayBuffer

  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: file.type },
    { name: 'Creator', value: owner },
    { name: 'Title', value: title },
    { name: 'Description', value: description },
    { name: 'Repo-Id', value: id },
    { name: 'Type', value: 'repo-create' },
    { name: 'Visibility', value: visibility }
  ] as Tag[]

  await waitFor(500)

  const dataTxResponse = await signAndSendTx(data, inputTags, userSigner, true)

  if (!dataTxResponse) {
    throw new Error('Failed to post Git repository')
  }

  await sendMessage({
    tags: getTags({
      Action: 'Initialize-Repo',
      Id: id,
      Name: title,
      Description: description,
      'Data-TxId': dataTxResponse,
      Visibility: 'public',
      'Private-State-TxId': '',
      'Token-Process-Id': tokenProcessId
    })
  })

  return { txResponse: dataTxResponse }
}

export async function updateGithubSync({ id, currentGithubSync, githubSync }: any) {
  const publicKey = await getActivePublicKey()

  const userSigner = await getSigner()

  if (githubSync?.accessToken) {
    const data = new TextEncoder().encode(githubSync.accessToken)
    if (!currentGithubSync?.privateStateTxId) {
      const pubKeyArray = [strToJwkPubKey(publicKey)]

      // Encrypt
      const { aesKey, encryptedFile: encryptedAccessToken, iv } = await encryptFileWithAesGcm(data)
      const encryptedAesKeysArray = await encryptAesKeyWithPublicKeys(aesKey, pubKeyArray)
      githubSync.accessToken = arweave.utils.bufferTob64Url(new Uint8Array(encryptedAccessToken))

      const privateState = {
        version: '0.1',
        iv,
        encKeys: encryptedAesKeysArray,
        pubKeys: [publicKey]
      }

      const privateInputTags = [
        { name: 'App-Name', value: 'Protocol.Land' },
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Type', value: 'private-github-sync-state' },
        { name: 'ID', value: id }
      ] as Tag[]

      const privateStateTxId = await signAndSendTx(JSON.stringify(privateState), privateInputTags, userSigner)

      if (!privateStateTxId) {
        throw new Error('Failed to post Private GitHub Sync State')
      }

      githubSync.privateStateTxId = privateStateTxId
    } else {
      const pubKey = await getActivePublicKey()
      const address = await deriveAddress(pubKey)

      const response = await fetch(`https://arweave.net/${currentGithubSync?.privateStateTxId}`)
      const privateState = (await response.json()) as PrivateState

      const encAesKeyStr = privateState.encKeys[address]
      const encAesKeyBuf = arweave.utils.b64UrlToBuffer(encAesKeyStr)

      const aesKey = (await decryptAesKeyWithPrivateKey(encAesKeyBuf)) as unknown as ArrayBuffer
      const ivArrBuff = arweave.utils.b64UrlToBuffer(privateState.iv)

      const encryptedAccessToken = await encryptDataWithExistingKey(data, aesKey, ivArrBuff)

      githubSync.accessToken = arweave.utils.bufferTob64Url(new Uint8Array(encryptedAccessToken))
    }
  }

  githubSync.partialUpdate = !!currentGithubSync

  await sendMessage({
    tags: getTags({
      Action: 'Update-Github-Sync',
      Id: id,
      'Github-Sync': JSON.stringify(githubSync)
    })
  })

  const repo = await getRepo(id)

  if (!repo) return

  if (!repo.githubSync) return

  return repo.githubSync
}

export async function createNewFork(data: ForkRepositoryOptions) {
  const uuid = uuidv4()

  await sendMessage({
    tags: getTags({
      Action: 'Fork-Repo',
      Id: uuid,
      Name: data.name,
      Description: data.description,
      'Data-TxId': data.dataTxId,
      Parent: data.parent
    })
  })

  return uuid
}

export async function postUpdatedRepo({ fs, dir, owner, id }: PostUpdatedRepoOptions) {
  const { error: initialError, result: initialBranch } = await getCurrentBranch({ fs, dir })

  if (initialError || (initialBranch && initialBranch !== 'master')) {
    await checkoutBranch({ fs, dir, name: 'master' })
  }

  await waitFor(500)

  const repoBlob = await packGitRepo({ fs, dir })

  const { result: currentBranch } = await getCurrentBranch({ fs, dir })

  // Checkout back to the initial branch if a different branch was checked out
  if (!initialError && initialBranch && currentBranch && currentBranch !== initialBranch) {
    await checkoutBranch({ fs, dir, name: initialBranch })
  }

  const userSigner = await getSigner()

  const data = (await toArrayBuffer(repoBlob)) as ArrayBuffer

  await waitFor(500)

  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: repoBlob.type },
    { name: 'Creator', value: owner },
    { name: 'Repo-Id', value: id },
    { name: 'Type', value: 'repo-update' }
  ] as Tag[]

  const dataTxResponse = await signAndSendTx(data, inputTags, userSigner, true)

  if (!dataTxResponse) {
    throw new Error('Failed to post Git repository')
  }

  await sendMessage({
    tags: getTags({
      Action: 'Update-Repo-TxId',
      Id: id,
      'Data-TxId': dataTxResponse
    })
  })

  return dataTxResponse
}

export async function addActivePubKeyToPrivateState(id: string, currentPrivateStateTxId: string, type = 'REPO') {
  const activePubKey = await getActivePublicKey()
  const userSigner = await getSigner()

  const response = await fetch(`https://arweave.net/${currentPrivateStateTxId}`)
  const currentPrivateState = (await response.json()) as unknown as PrivateState

  const privateState = {
    ...currentPrivateState,
    pubKeys: [...currentPrivateState.pubKeys, activePubKey]
  }

  const privateInputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: 'application/json' },
    { name: 'Type', value: type === 'REPO' ? 'private-state' : 'private-github-sync-state' },
    { name: 'ID', value: id }
  ] as Tag[]

  const privateStateTxResponse = await signAndSendTx(JSON.stringify(privateState), privateInputTags, userSigner)

  if (!privateStateTxResponse) {
    throw new Error('Failed to post updated Private State')
  }

  return privateStateTxResponse
}

export async function rotateKeysAndUpdate({ id, currentPrivateStateTxId, type }: RotateKeysAndUpdateOptions) {
  const isRepoAction = type === 'REPO'
  const activePubKey = await getActivePublicKey()
  const userSigner = await getSigner()

  const activeAddress = await deriveAddress(activePubKey)
  const response = await fetch(`https://arweave.net/${currentPrivateStateTxId}`)
  const currentPrivateState = (await response.json()) as unknown as PrivateState

  const pubKeyArray = currentPrivateState.pubKeys.map((pubKey) => strToJwkPubKey(pubKey))

  const encAesKeyStr = currentPrivateState.encKeys[activeAddress]
  const encAesKeyBuf = arweave.utils.b64UrlToBuffer(encAesKeyStr)

  const aesKey = (await decryptAesKeyWithPrivateKey(encAesKeyBuf)) as unknown as ArrayBuffer
  const encryptedAesKeysArray = await encryptAesKeyWithPublicKeys(aesKey, pubKeyArray)

  const privateState: PrivateState = {
    ...currentPrivateState,
    encKeys: encryptedAesKeysArray
  }

  const privateInputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: 'application/json' },
    { name: 'Type', value: isRepoAction ? 'private-state' : 'private-github-sync-state' },
    { name: 'ID', value: id }
  ] as Tag[]

  const privateStateTxId = await signAndSendTx(JSON.stringify(privateState), privateInputTags, userSigner)

  if (!privateStateTxId) {
    throw new Error('Failed to post Private State')
  }

  const tags = getTags(
    isRepoAction
      ? { Action: 'Update-Repo-Private-State-TxId', Id: id, 'Private-State-TxId': privateStateTxId }
      : {
          Action: 'Update-Github-Sync',
          Id: id,
          'Github-Sync': JSON.stringify({ privateStateTxId, allowPending: true, partialUpdate: true })
        }
  )

  await sendMessage({ tags })
}

export async function githubSyncAllowPending(id: string, currentPrivateStateTxId: string) {
  await rotateKeysAndUpdate({ id, currentPrivateStateTxId, type: 'GITHUB_SYNC' })

  const repo = await getRepo(id)

  if (!repo) return

  if (!repo.githubSync) return

  return repo.githubSync
}

export async function createNewRepo(title: string, fs: FSType, owner: string, id: string) {
  const dir = `/${id}`
  const filePath = `${dir}/README.md`

  try {
    await git.init({ fs, dir })

    await fs.promises.writeFile(filePath, `# ${title}`)

    await git.add({ fs, dir, filepath: 'README.md' })

    const user = useGlobalStore.getState().userState.allUsers.get(owner)

    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: user?.fullname || owner,
        email: user?.email || owner
      },
      message: 'Add README.md'
    })

    await waitFor(1000)

    const repoBlob = await packGitRepo({ fs, dir })

    return { repoBlob, commit: sha }
  } catch (error) {
    console.error('failed to create repo')
  }
}

export async function importRepoFromBlob(fs: FSType, dir: string, repoBlob: Blob) {
  const status = await unpackGitRepo({ fs, dir, blob: repoBlob })

  if (!status) {
    return false
  }

  return true
}

export async function unmountRepoFromBrowser(name: string) {
  const { error } = await withAsync(() => new Dexie(name).delete())

  if (error) {
    return false
  }

  return true
}

export async function updateRepoName(repoId: string, newName: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Update-Repo-Details',
      Id: repoId,
      Name: newName
    })
  })
}

export async function updateRepoDescription(description: string, repoId: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Update-Repo-Details',
      Id: repoId,
      Description: description
    })
  })
}

export async function updateRepoDeploymentBranch(deploymentBranch: string, repoId: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Update-Repo-Details',
      Id: repoId,
      'Deployment-Branch': deploymentBranch
    })
  })
}

export async function addDeployment(deployment: Partial<Deployment>, repoId: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Add-Deployment',
      Id: repoId,
      Deployment: JSON.stringify(deployment)
    })
  })

  const repo = await getRepo(repoId)

  if (!repo) return

  const deployments = repo.deployments
  const latestDeployment = deployments[deployments.length - 1]

  if (!latestDeployment || !latestDeployment.txId) return

  return latestDeployment
}

export async function inviteContributor(address: string, repoId: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Invite-Contributor',
      Id: repoId,
      Contributor: address
    })
  })

  const repo = await getRepo(repoId)

  return repo.contributorInvites
}

export async function addDomain(domain: Omit<Domain, 'timestamp'>, repoId: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Add-Domain',
      Id: repoId,
      Domain: JSON.stringify(domain)
    })
  })

  const repo = await getRepo(repoId)

  return repo.domains
}

export async function updateDomain(domain: Omit<Domain, 'controller' | 'timestamp'>, repoId: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Update-Domain',
      Id: repoId,
      Domain: JSON.stringify(domain)
    })
  })

  const repo = await getRepo(repoId)

  return repo.domains
}

export async function addContributor(address: string, repoId: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Grant-Contributor-Invite',
      Id: repoId,
      Contributor: address
    })
  })
}

type PostUpdatedRepoOptions = {
  id: string
  fs: FSType
  dir: string
  owner: string
  isPrivate: boolean
  privateStateTxId?: string
}

type RotateKeysAndUpdateOptions = {
  id: string
  currentPrivateStateTxId: string
  type: 'REPO' | 'GITHUB_SYNC'
}
