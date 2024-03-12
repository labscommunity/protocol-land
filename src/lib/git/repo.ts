import { createDataItemSigner, dryrun, message, result } from '@permaweb/aoconnect'
import Arweave from 'arweave'
import { Tag } from 'arweave/web/lib/transaction'
import Dexie from 'dexie'
import git from 'isomorphic-git'
import { v4 as uuidv4 } from 'uuid'

import { AOS_PROCESS_ID } from '@/helpers/constants'
import { extractMessage } from '@/helpers/extractMessage'
import { getTags } from '@/helpers/getTags'
import { toArrayBuffer } from '@/helpers/toArrayBuffer'
import { waitFor } from '@/helpers/waitFor'
import { getActivePublicKey } from '@/helpers/wallet/getPublicKey'
import { getSigner } from '@/helpers/wallet/getSigner'
import { signAndSendTx } from '@/helpers/wallet/signAndSend'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'
import { ForkRepositoryOptions } from '@/stores/repository-core/types'
import { Deployment, Domain, PrivateState, Repo } from '@/types/repository'

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
  const publicKey = await getActivePublicKey()

  const userSigner = await getSigner()

  let data = (await toArrayBuffer(file)) as ArrayBuffer

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

    const privateInputTags = [
      { name: 'App-Name', value: 'Protocol.Land' },
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Type', value: 'private-state' },
      { name: 'ID', value: id }
    ] as Tag[]

    const privateStateTxResponse = await signAndSendTx(JSON.stringify(privateState), privateInputTags, userSigner)

    if (!privateStateTxResponse) {
      throw new Error('Failed to post Private State')
    }

    privateStateTxId = privateStateTxResponse

    data = encryptedFile
  }

  await waitFor(500)

  const dataTxResponse = await signAndSendTx(data, inputTags, userSigner, true)

  if (!dataTxResponse) {
    throw new Error('Failed to post Git repository')
  }

  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Initialize-Repository',
      Id: id,
      Name: title,
      Description: description,
      DataTxId: dataTxResponse,
      Visibility: visibility,
      PrivateStateTxId: privateStateTxId
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

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

  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Github-Sync',
      Id: id,
      GithubSync: JSON.stringify(githubSync)
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: id
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  if (!repo) return

  if (!repo.githubSync) return

  return repo.githubSync
}

export async function createNewFork(data: ForkRepositoryOptions) {
  const uuid = uuidv4()

  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Fork-Repository',
      Id: uuid,
      Name: data.name,
      Description: data.description,
      DataTxId: data.dataTxId,
      Parent: data.parent
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

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

  const userSigner = await getSigner()

  let data = (await toArrayBuffer(repoBlob)) as ArrayBuffer

  await waitFor(500)

  if (isPrivate && privateStateTxId) {
    const pubKey = await getActivePublicKey()
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
    { name: 'Repo-Id', value: id },
    { name: 'Type', value: 'repo-update' }
  ] as Tag[]

  const dataTxResponse = await signAndSendTx(data, inputTags, userSigner, true)

  if (!dataTxResponse) {
    throw new Error('Failed to post Git repository')
  }

  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Repository-TxId',
      Id: id,
      DataTxId: dataTxResponse
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

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
      ? { Action: 'Update-Repository-PrivateStateTx', Id: id, PrivateStateTxId: privateStateTxId }
      : {
          Action: 'Update-Github-Sync',
          Id: id,
          GithubSync: JSON.stringify({ privateStateTxId, allowPending: true, partialUpdate: true })
        }
  )

  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags,
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }
}

export async function githubSyncAllowPending(id: string, currentPrivateStateTxId: string) {
  await rotateKeysAndUpdate({ id, currentPrivateStateTxId, type: 'GITHUB_SYNC' })

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: id
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

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
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Repository-Details',
      Id: repoId,
      Name: newName
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }
}

export async function updateRepoDescription(description: string, repoId: string) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Repository-Details',
      Id: repoId,
      Description: description
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }
}

export async function updateRepoDeploymentBranch(deploymentBranch: string, repoId: string) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Repository-Details',
      Id: repoId,
      DeploymentBranch: deploymentBranch
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }
}

export async function addDeployment(deployment: Partial<Deployment>, repoId: string) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Add-Deployment',
      Id: repoId,
      Deployment: JSON.stringify(deployment)
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: repoId
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  if (!repo) return

  const deployments = repo.deployments
  const latestDeployment = deployments[deployments.length - 1]

  if (!latestDeployment || !latestDeployment.txId) return

  return latestDeployment
}

export async function inviteContributor(address: string, repoId: string) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Invite-Contributor',
      Id: repoId,
      Contributor: address
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: repoId
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  return repo.contributorInvites
}

export async function addDomain(domain: Omit<Domain, 'timestamp'>, repoId: string) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Add-Domain',
      Id: repoId,
      Domain: JSON.stringify(domain)
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: repoId
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  return repo.domains
}

export async function updateDomain(domain: Omit<Domain, 'controller' | 'timestamp'>, repoId: string) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Update-Domain',
      Id: repoId,
      Domain: JSON.stringify(domain)
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: repoId
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  return repo.domains
}

export async function addContributor(address: string, repoId: string) {
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Add-Contributor',
      Id: repoId,
      Contributor: address
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }
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
