import LightningFS from '@isomorphic-git/lightning-fs'
import { createAndPostTransactionWOthent } from 'arweavekit/transaction'
import Dexie from 'dexie'
import { exportDB } from 'dexie-export-import'
import git from 'isomorphic-git'
import { WarpFactory } from 'warp-contracts'
import { DeployPlugin } from 'warp-contracts-plugin-deploy'

import { CONTRACT_SRC_TX_ID, VITE_OTHENT_API_KEY } from '@/helpers/constants'
import { toArrayBuffer } from '@/helpers/toArrayBuffer'

const warp = WarpFactory.forMainnet().use(new DeployPlugin())

export async function postNewRepo({ title, description, file, owner }: any) {
  const data = (await toArrayBuffer(file)) as any

  const inputTags = [
    // Content mime (media) type (For eg, "image/png")
    { name: 'Content-Type', value: file.type },
    // Help network identify post as SmartWeave Contract
    { name: 'App-Name', value: 'SmartWeaveContract' },
    { name: 'App-Version', value: '0.3.0' },
    // Link post to contract source
    { name: 'Contract-Src', value: CONTRACT_SRC_TX_ID },
    // Initial state for our post (as a contract instance)
    {
      name: 'Init-State',
      value: JSON.stringify({
        title,
        description,
        owner: owner,
        contributors: [],
        repoTxId: 'CoHV9S5po6aQ1cx-MxW47qbmu63scIkVKdleqTyL4JQ'
      })
    },
    // Standard tags following ANS-110 standard for discoverability of asset
    { name: 'Creator', value: owner },
    { name: 'Title', value: title },
    { name: 'Description', value: description },
    { name: 'Type', value: 'repo' }
  ]
  console.log({VITE_OTHENT_API_KEY})
  const transaction = await createAndPostTransactionWOthent({
    apiId: VITE_OTHENT_API_KEY,
    othentFunction: 'uploadData',
    data: data,
    tags: inputTags,
    useBundlr: true
  })

  // registering transaction with warp
  const { contractTxId } = await warp.register(transaction.transactionId, 'node1')

  console.log('Othent Arweave Txn Res', contractTxId)

  // returns the success status and transaction id of the post
  return transaction
}

export async function createNewRepo(title: string) {
  const fs = new LightningFS(title)

  const dir = `/${title}`

  try {
    await git.init({ fs, dir })

    const repoDB = await new Dexie(title).open();
    const repoBlob = await exportDB(repoDB)

    return repoBlob
  } catch (error) {
    //
    console.log({ error })
    console.error('failed to create repo')
  }
}
