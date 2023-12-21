import Arweave from 'arweave'
import Dexie from 'dexie'
import git from 'isomorphic-git'
import { v4 as uuidv4 } from 'uuid'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { toArrayBuffer } from '@/helpers/toArrayBuffer'
import { waitFor } from '@/helpers/waitFor'
import { withAsync } from '@/helpers/withAsync'
import { ForkRepositoryOptions } from '@/stores/repository-core/types'
import { Deployment, PrivateState, Repo } from '@/types/repository'

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

export async function postNewRepo({ id, title, description, file, owner, visibility }: any) {
  const publicKey = await window.arweaveWallet.getActivePublicKey()

  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  let data = (await toArrayBuffer(file)) as ArrayBuffer

  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: file.type },
    { name: 'Creator', value: owner },
    { name: 'Title', value: title },
    { name: 'Description', value: description },
    { name: 'Type', value: 'repo-create' },
    { name: 'Visibility', value: visibility }
  ]

  let privateStateTxId = ''
  if (visibility === 'private') {
    const pubKeyArray = [strToJwkPubKey(publicKey)]
    // Encrypt
    const { aesKey, encryptedFile, iv } = await encryptFileWithAesGcm(data)
    const encryptedAesKeysArray = await encryptAesKeyWithPublicKeys(aesKey, pubKeyArray)
    // // Store 'encrypted', 'iv', and 'encryptedKeyArray' securely

    const privateState = {
      version: '0.1',
      iv,
      encKeys: encryptedAesKeysArray,
      pubKeys: [publicKey]
    }

    const privateStateTx = await arweave.createTransaction({
      data: JSON.stringify(privateState)
    })

    privateStateTx.addTag('Content-Type', 'application/json')
    privateStateTx.addTag('App-Name', 'Protocol.Land')
    privateStateTx.addTag('Type', 'private-state')
    privateStateTx.addTag('ID', id)

    const privateStateTxResponse = await window.arweaveWallet.dispatch(privateStateTx)

    if (!privateStateTxResponse) {
      throw new Error('Failed to post Private State')
    }

    privateStateTxId = privateStateTxResponse.id

    data = encryptedFile
  }

  await waitFor(500)

  const transaction = await arweave.createTransaction({
    data
  })

  inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

  const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

  if (!dataTxResponse) {
    throw new Error('Failed to post Git repository')
  }

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'initialize',
    payload: {
      id,
      name: title,
      description,
      dataTxId: dataTxResponse.id,
      visibility,
      privateStateTxId
    }
  })

  return { txResponse: dataTxResponse }
}

export async function createNewFork(data: ForkRepositoryOptions) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  const uuid = uuidv4()
  await contract.writeInteraction({
    function: 'forkRepository',
    payload: {
      id: uuid,
      name: data.name,
      description: data.description,
      dataTxId: data.dataTxId,
      parent: data.parent
    }
  })

  return uuid
}

export async function postUpdatedRepo({ fs, dir, owner, id, isPrivate, privateStateTxId }: PostUpdatedRepoOptions) {
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

  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  let data = (await toArrayBuffer(repoBlob)) as ArrayBuffer

  await waitFor(500)

  if (isPrivate && privateStateTxId) {
    const pubKey = await window.arweaveWallet.getActivePublicKey()
    const address = await deriveAddress(pubKey)

    const response = await fetch(`https://arweave.net/${privateStateTxId}`)
    const privateState = (await response.json()) as PrivateState

    const encAesKeyStr = privateState.encKeys[address]
    const encAesKeyBuf = arweave.utils.b64UrlToBuffer(encAesKeyStr)

    const aesKey = (await decryptAesKeyWithPrivateKey(encAesKeyBuf)) as unknown as ArrayBuffer
    const ivArrBuff = arweave.utils.b64UrlToBuffer(privateState.iv)

    data = await encryptDataWithExistingKey(data, aesKey, ivArrBuff)
  }

  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: repoBlob.type },
    { name: 'Creator', value: owner },
    { name: 'Type', value: 'repo-update' }
  ]

  const transaction = await arweave.createTransaction({
    data
  })

  inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

  const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

  if (!dataTxResponse) {
    throw new Error('Failed to post Git repository')
  }

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateRepositoryTxId',
    payload: {
      id,
      dataTxId: dataTxResponse.id
    }
  })

  return dataTxResponse
}

export async function addActivePubKeyToPrivateState(id: string, currentPrivateStateTxId: string) {
  const activePubKey = await window.arweaveWallet.getActivePublicKey()
  const response = await fetch(`https://arweave.net/${currentPrivateStateTxId}`)
  const currentPrivateState = (await response.json()) as unknown as PrivateState

  const privateState = {
    ...currentPrivateState,
    pubKeys: [...currentPrivateState.pubKeys, activePubKey]
  }

  const privateStateTx = await arweave.createTransaction({
    data: JSON.stringify(privateState)
  })

  privateStateTx.addTag('Content-Type', 'application/json')
  privateStateTx.addTag('App-Name', 'Protocol.Land')
  privateStateTx.addTag('Type', 'private-state')
  privateStateTx.addTag('ID', id)

  const privateStateTxResponse = await window.arweaveWallet.dispatch(privateStateTx)

  if (!privateStateTxResponse) {
    throw new Error('Failed to post updated Private State')
  }

  return privateStateTxResponse.id
}

export async function rotateKeysAndUpdateRepo({ id, currentPrivateStateTxId }: RotateKeysAndUpdateRepoOptions) {
  const activePubKey = await window.arweaveWallet.getActivePublicKey()
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

  const privateStateTx = await arweave.createTransaction({
    data: JSON.stringify(privateState)
  })

  privateStateTx.addTag('Content-Type', 'application/json')
  privateStateTx.addTag('App-Name', 'Protocol.Land')
  privateStateTx.addTag('Type', 'private-state')
  privateStateTx.addTag('ID', id)

  const privateStateTxResponse = await window.arweaveWallet.dispatch(privateStateTx)

  if (!privateStateTxResponse) {
    throw new Error('Failed to post Private State')
  }

  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updatePrivateStateTx',
    payload: {
      id,
      privateStateTxId: privateStateTxResponse.id
    }
  })
}

export async function createNewRepo(title: string, fs: FSType, owner: string) {
  const dir = `/${title}`
  const filePath = `${dir}/README.md`

  try {
    await git.init({ fs, dir })

    await fs.promises.writeFile(filePath, `# ${title}`)

    await git.add({ fs, dir, filepath: 'README.md' })

    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: owner,
        email: owner
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

export async function updateRepoName(oldName: string, newName: string, repoId: string) {
  await unmountRepoFromBrowser(oldName)

  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateRepositoryDetails',
    payload: {
      id: repoId,
      name: newName
    }
  })
}

export async function updateRepoDescription(description: string, repoId: string) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateRepositoryDetails',
    payload: {
      id: repoId,
      description
    }
  })
}

export async function updateRepoDeploymentBranch(deploymentBranch: string, repoId: string) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateRepositoryDetails',
    payload: {
      id: repoId,
      deploymentBranch
    }
  })
}

export async function addDeployment(deployment: Partial<Deployment>, repoId: string) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'addDeployment',
    payload: {
      id: repoId,
      deployment
    }
  })

  const {
    cachedValue: {
      state: { repos }
    }
  } = await contract.readState()

  const repo = repos[repoId] as Repo

  if (!repo) return

  const deployments = repo.deployments
  const latestDeployment = deployments[deployments.length - 1]

  if (!latestDeployment || !latestDeployment.txId) return

  return latestDeployment
}

export async function inviteContributor(address: string, repoId: string) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'inviteContributor',
    payload: {
      id: repoId,
      contributor: address
    }
  })

  const {
    cachedValue: {
      state: { repos }
    }
  } = await contract.readState()

  const repo = repos[repoId] as Repo

  return repo.contributorInvites
}

export async function addContributor(address: string, repoId: string) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'addContributor',
    payload: {
      id: repoId,
      contributor: address
    }
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

type RotateKeysAndUpdateRepoOptions = {
  id: string
  currentPrivateStateTxId: string
}
