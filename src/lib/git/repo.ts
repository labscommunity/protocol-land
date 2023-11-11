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

import { checkoutBranch, getCurrentBranch } from './branch'
import { FSType } from './helpers/fsWithName'
import { packGitRepo, unpackGitRepo } from './helpers/zipUtils'

const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})

export async function postNewRepo({ title, description, file, owner }: any) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const data = (await toArrayBuffer(file)) as ArrayBuffer

  await waitFor(500)

  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: file.type },
    { name: 'Creator', value: owner },
    { name: 'Title', value: title },
    { name: 'Description', value: description },
    { name: 'Type', value: 'repo-create' }
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

  const uuid = uuidv4()
  await contract.writeInteraction({
    function: 'initialize',
    payload: {
      id: uuid,
      name: title,
      description,
      dataTxId: dataTxResponse.id
    }
  })

  return { txResponse: dataTxResponse, id: uuid }
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

export async function postUpdatedRepo({ fs, dir, owner, id }: PostUpdatedRepoOptions) {
  const { error: initialError, result: initialBranch } = await getCurrentBranch({ fs, dir })

  if (!initialError && initialBranch && initialBranch !== 'master') {
    await checkoutBranch({ fs, dir, name: 'master' })
  }

  await waitFor(500)

  const repoBlob = await packGitRepo({ fs, dir })

  const { error: currentError, result: currentBranch } = await getCurrentBranch({ fs, dir })

  // Checkout back to the initial branch if a different branch was checked out
  if (!initialError && !currentError && initialBranch && currentBranch && currentBranch !== initialBranch) {
    await checkoutBranch({ fs, dir, name: initialBranch })
  }

  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const data = (await toArrayBuffer(repoBlob)) as ArrayBuffer

  await waitFor(500)

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
    //
    console.log({ error })
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
}
