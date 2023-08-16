import LightningFS from '@isomorphic-git/lightning-fs'
import Arweave from 'arweave'
import Dexie from 'dexie'
import { exportDB } from 'dexie-export-import'
import git from 'isomorphic-git'
import uuid from 'react-uuid'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { toArrayBuffer } from '@/helpers/toArrayBuffer'

const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})

export async function postNewRepo({ title, description, file, owner }: any) {
  const data = (await toArrayBuffer(file)) as any

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

  const contract = getWarpContract(CONTRACT_TX_ID, 'use_wallet')
  
  await contract.writeInteraction(
    {
      function: 'initialize',
      payload: {
        id: uuid(),
        name: title,
        description,
        dataTxId: dataTxResponse.id
      }
    },
    {
      disableBundling: true
    }
  )

  return dataTxResponse
}

export async function createNewRepo(title: string) {
  const fs = new LightningFS(title)

  const dir = `/${title}`

  try {
    await git.init({ fs, dir })

    const repoDB = await new Dexie(title).open()
    const repoBlob = await exportDB(repoDB)

    return repoBlob
  } catch (error) {
    //
    console.log({ error })
    console.error('failed to create repo')
  }
}
