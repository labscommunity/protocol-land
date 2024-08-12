import { createDataItemSigner, result, spawn } from '@permaweb/aoconnect'
import Arweave from 'arweave'
import { Tag } from 'arweave/web/lib/transaction'

import { getTags } from '@/helpers/getTags'
import { waitFor } from '@/helpers/waitFor'
import { getSigner } from '@/helpers/wallet/getSigner'
import { createTokenLua } from '@/pages/repository/helpers/createTokenLua'
import { RepoToken } from '@/types/repository'

import { sendMessage } from '../contract'

const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})

export async function decentralizeRepo(repoId: string, tokenId: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Decentralize-Repo',
      Id: repoId,
      'Token-Id': tokenId
    })
  })
}

export async function createRepoToken(token: RepoToken) {
  try {
    const pid = await spawnTokenProcess(token.tokenName)
    await loadTokenProcess(token, pid)

    return pid
  } catch (error) {
    console.log({ error })
    return false
  }
}

async function spawnTokenProcess(tokenName: string) {
  const signer = await getSigner({ injectedSigner: false })
  const aosDetails = await getAosDetails()
  const tags = [
    { name: 'App-Name', value: 'aos' },
    { name: 'Name', value: tokenName || 'Protocol.Land Repo Token' },
    { name: 'Process-Type', value: 'token' },
    { name: 'aos-Version', value: aosDetails.version }
  ] as Tag[]

  const pid = await spawn({
    module: aosDetails.module,
    tags,
    scheduler: aosDetails.scheduler,
    data: '1984',
    signer: createDataItemSigner(signer)
  })

  await pollForTxBeingAvailable({ txId: pid })

  return pid
}

async function loadTokenProcess(token: RepoToken, pid: string) {
  const contractSrc = createTokenLua(token)

  const args = {
    tags: getTags({
      Action: 'Eval'
    }),
    data: contractSrc,
    pid
  }

  await sendMessage(args)
}

async function getAosDetails() {
  const defaultDetails = {
    version: '1.10.22',
    module: 'SBNb1qPQ1TDwpD_mboxm2YllmMLXpWw4U8P9Ff8W9vk',
    scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA'
  }

  try {
    const response = await fetch('https://raw.githubusercontent.com/permaweb/aos/main/package.json')
    const pkg = (await response.json()) as {
      version: string
      aos: { module: string }
    }
    const details = {
      version: pkg?.version || defaultDetails.version,
      module: pkg?.aos?.module || defaultDetails.module,
      scheduler: defaultDetails.scheduler
    }
    return details
  } catch {
    return defaultDetails
  }
}

export async function pollForTxBeingAvailable({ txId }: { txId: string }): Promise<void> {
  const pollingOptions = {
    maxAttempts: 10,
    pollingIntervalMs: 3_000,
    initialBackoffMs: 7_000
  }
  const { maxAttempts, pollingIntervalMs, initialBackoffMs } = pollingOptions

  console.log('Polling for transaction...', { txId })
  await waitFor(initialBackoffMs)

  let attempts = 0
  while (attempts < maxAttempts) {
    let transaction
    attempts++

    try {
      const response = await arweave.api.post('/graphql', {
        query: `
        query {
          transaction(id: "${txId}") {
            recipient
            owner {
              address
            }
            quantity {
              winston
            }
          }
        }
        `
      })

      transaction = response?.data?.data?.transaction
    } catch (err) {
      // Continue retries when request errors
      console.log('Failed to poll for transaction...', { err })
    }

    if (transaction) {
      return
    }
    console.log('Transaction not found...', {
      txId,
      attempts,
      maxAttempts,
      pollingIntervalMs
    })
    await waitFor(pollingIntervalMs)
  }

  throw new Error('Transaction not found after polling, transaction id: ' + txId)
}

export async function fetchTokenBalance(tokenId: string) {
  const messageId = await sendMessage({
    tags: [{ name: 'Action', value: 'Balance' }],
    pid: tokenId
  })
  const { Messages } = await result({
    message: messageId,
    process: tokenId
  })

  if (!Messages[0]) {
    throw new Error('No message found')
  }

  return Messages[0].Data.toString()
}
