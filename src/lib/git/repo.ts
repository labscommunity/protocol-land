import Arweave from 'arweave'
import Dexie from 'dexie'
import { exportDB, importDB } from 'dexie-export-import'
import git from 'isomorphic-git'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { toArrayBuffer } from '@/helpers/toArrayBuffer'
import { waitFor } from '@/helpers/waitFor'
import { withAsync } from '@/helpers/withAsync'

import { FSType } from './helpers/fsWithName'

const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})

export async function postNewRepo({ title, description, file, owner }: any) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const data = (await toArrayBuffer(file)) as ArrayBuffer

  const validRepoData = verifyArrayBuffer(data)

  if (!validRepoData) {
    await unmountRepoFromBrowser(title)

    throw new Error('Failed to post Git repository. Invalid data.')
  }

  const inputTags = [
    // Content mime (media) type (For eg, "image/png")
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: file.type },
    { name: 'Creator', value: owner },
    { name: 'Title', value: title },
    { name: 'Description', value: description },
    { name: 'Type', value: 'repo' }
  ]

  const transaction = await arweave.createTransaction({
    data
  })

  inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

  const dataTxResponse = await window.arweaveWallet.dispatch(transaction)
  console.log({ dataTxResponse })
  if (!dataTxResponse) {
    throw new Error('Failed to post Git repository')
  }

  const contract = getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'initialize',
    payload: {
      name: title,
      description,
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

    const repoDB = new Dexie(title)
    await repoDB.open()

    const repoBlob = await exportDB(repoDB)

    return { repoBlob, commit: sha }
  } catch (error) {
    //
    console.log({ error })
    console.error('failed to create repo')
  }
}

export async function importRepoFromBlob(repoBlob: Blob) {
  const DB = await importDB(repoBlob)

  if (!DB) {
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

function verifyArrayBuffer(repoArrayBuf: ArrayBuffer) {
  const decoder = new TextDecoder('utf-8')
  const decoded = JSON.parse(decoder.decode(repoArrayBuf))

  if (decoded.data.data[0].rows.length !== 9) {
    return false
  }

  return true
}
