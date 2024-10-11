import { createDataItemSigner, dryrun, spawn } from '@permaweb/aoconnect'
import Arweave from 'arweave'
import { Tag } from 'arweave/web/lib/transaction'

import { getTags } from '@/helpers/getTags'
import { waitFor } from '@/helpers/waitFor'
import { getSigner } from '@/helpers/wallet/getSigner'
import { createTokenLua } from '@/pages/repository/helpers/createTokenLua'
import { RepoToken } from '@/types/repository'

import { sendMessage } from '../contract'

const arweave = new Arweave({
  host: 'arweave-search.goldsky.com',
  port: 443,
  protocol: 'https'
})

export async function decentralizeRepo(repoId: string) {
  await sendMessage({
    tags: getTags({
      Action: 'Decentralize-Repo',
      Id: repoId
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

export async function spawnTokenProcess(tokenName: string) {
  const signer = await getSigner({ injectedSigner: false })
  const aosDetails = await getAosDetails()
  const tags = [
    { name: 'App-Name', value: 'aos' },
    { name: 'Name', value: tokenName || 'Protocol.Land Repo Token' },
    { name: 'Process-Type', value: 'token' },
    { name: 'aos-Version', value: aosDetails.version },
    { name: 'Authority', value: 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY' }
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

export async function loadTokenProcess(token: RepoToken, pid: string) {
  const contractSrc = createTokenLua(token)

  const args = {
    tags: getTags({
      Action: 'Eval'
    }),
    data: contractSrc,
    pid
  }

  const msgId = await sendMessage(args)
  await pollForTxBeingAvailable({ txId: msgId })

  const { Messages } = await dryrun({
    process: pid,
    tags: getTags({
      Action: 'Info'
    })
  })

  if (!Messages[0]) {
    throw new Error('Token Loading Failed')
  }

  const msg = Messages[0]
  const ticker = msg.Tags.find((tag: any) => tag.name === 'Ticker')?.value

  if (!ticker) {
    throw new Error('Token Loading Failed')
  }

  return true
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

const POOL_CONFIRM_ACTION = 'Add-Pool-Confirmation'
const POOL_ERROR_ACTION = 'Add-Pool-Error'

export async function pollLiquidityPoolMessages(msgId: string) {
  const pollingOptions = {
    maxAttempts: 50,
    pollingIntervalMs: 3_000,
    initialBackoffMs: 7_000
  }
  const { maxAttempts, pollingIntervalMs, initialBackoffMs } = pollingOptions

  console.log('Polling for transaction...', { msgId })
  await waitFor(initialBackoffMs)

  let attempts = 0
  while (attempts < maxAttempts) {
    let transaction
    attempts++

    try {
      const response = await arweave.api.post('/graphql', {
        query:
          'query ($messageId: String!, $limit: Int!, $sortOrder: SortOrder!, $cursor: String) {\n  transactions(\n    sort: $sortOrder\n    first: $limit\n    after: $cursor\n    tags: [{name: \n"Pushed-For", values: [$messageId]}]\n ) {\n    count\n    ...MessageFields\n  }\n}\nfragment MessageFields on TransactionConnection {\n  edges {\n    cursor\n    node {\n      id\n      ingested_at\n      recipient\n      block {\n        timestamp\n        height\n      }\n      tags {\n        name\n        value\n      }\n      data {\n        size\n      }\n      owner {\n        address\n      }\n    }\n  }\n}',
        variables: {
          messageId: msgId,
          limit: 100,
          sortOrder: 'INGESTED_AT_ASC',
          cursor: ''
        }
      })

      transaction = response?.data?.data?.transactions
      console.log({ transaction })
    } catch (err) {
      // Continue retries when request errors
      console.log('Failed to poll for transaction...', { err })
    }

    if (transaction) {
      const messages = transaction.edges.map((edge: any) => edge.node)

      for (const msg of messages) {
        const poolErrorMessage = msg.tags.find((tag: any) => tag.name === 'Action' && tag.value === POOL_ERROR_ACTION)
        const poolStatus = msg.tags.find((tag: any) => tag.name === 'Status')?.value

        if (poolErrorMessage) {
          const errMessage = msg.tags.find((tag: any) => tag.name === 'Error')?.value
          console.log({ poolId: null, poolStatus, message: errMessage })
          return { poolId: null, poolStatus, message: errMessage }
        }

        const poolConfirmationMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === POOL_CONFIRM_ACTION
        )

        if (poolConfirmationMessage) {
          const poolId = msg.tags.find((tag: any) => tag.name === 'Pool-Id')?.value
          console.log({ poolId, poolStatus })
          return { poolId, poolStatus }
        }
      }
    }
    console.log('Transaction not found...', {
      msgId,
      attempts,
      maxAttempts,
      pollingIntervalMs
    })
    await waitFor(pollingIntervalMs)
  }

  throw new Error('Transaction not found after polling, transaction id: ' + msgId)
}

const PROVIDE_CONFIRM_ACTION = 'Provide-Confirmation'
const PROVIDE_ERROR_ACTION = 'Provide-Error'
export async function pollLiquidityProvideMessages(msgId: string) {
  const pollingOptions = {
    maxAttempts: 50,
    pollingIntervalMs: 3_000,
    initialBackoffMs: 7_000
  }
  const { maxAttempts, pollingIntervalMs, initialBackoffMs } = pollingOptions

  console.log('Polling for transaction...', { msgId })
  await waitFor(initialBackoffMs)

  let attempts = 0
  while (attempts < maxAttempts) {
    let transaction
    attempts++

    try {
      const response = await arweave.api.post('/graphql', {
        query:
          'query ($messageId: String!, $limit: Int!, $sortOrder: SortOrder!, $cursor: String) {\n  transactions(\n    sort: $sortOrder\n    first: $limit\n    after: $cursor\n    tags: [{name: \n"Pushed-For", values: [$messageId]}] \n ) {\n    count\n    ...MessageFields\n  }\n}\nfragment MessageFields on TransactionConnection {\n  edges {\n    cursor\n    node {\n      id\n      ingested_at\n      recipient\n      block {\n        timestamp\n        height\n      }\n      tags {\n        name\n        value\n      }\n      data {\n        size\n      }\n      owner {\n        address\n      }\n    }\n  }\n}',
        variables: {
          messageId: msgId,
          limit: 100,
          sortOrder: 'INGESTED_AT_ASC',
          cursor: ''
        }
      })

      transaction = response?.data?.data?.transactions
      console.log({ transaction })
    } catch (err) {
      // Continue retries when request errors
      console.log('Failed to poll for transaction...', { err })
    }

    if (transaction) {
      const messages = transaction.edges.map((edge: any) => edge.node)

      for (const msg of messages) {
        const provideErrorMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === PROVIDE_ERROR_ACTION
        )

        if (provideErrorMessage) {
          const errMessage = msg.tags.find((tag: any) => tag.name === 'Error')?.value
          return { status: 'ERROR', message: errMessage || 'Provide failed.' }
        }

        const provideConfirmationMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === PROVIDE_CONFIRM_ACTION
        )

        if (provideConfirmationMessage) {
          return { status: 'OK' }
        }
      }
    }
    console.log('Transaction not found...', {
      msgId,
      attempts,
      maxAttempts,
      pollingIntervalMs
    })
    await waitFor(pollingIntervalMs)
  }

  throw new Error('Transaction not found after polling, transaction id: ' + msgId)
}

export async function fetchTokenBalance(tokenId: string, address: string) {
  const { Messages } = await dryrun({
    process: tokenId,
    owner: address,
    tags: [
      { name: 'Action', value: 'Balance' },
      { name: 'Target', value: address }
    ]
  })

  if (!Messages || !Messages.length) {
    console.log('No message found', { tokenId, address })

    return '0'
  }
  const balanceTagValue = Messages[0].Tags.find((tag: any) => tag.name === 'Balance')?.value
  const balance = Messages[0].Data ? Messages[0].Data : balanceTagValue || '0'

  return balance
}

export async function fetchTokenInfo(tokenId: string) {
  const { Messages } = await dryrun({
    process: tokenId,
    tags: [{ name: 'Action', value: 'Info' }]
  })

  if (!Messages || !Messages.length) {
    console.log('No message found', { tokenId })

    return null
  }

  const tokenData = decodeTokenDetailsFromMessage(Messages[0])

  return {
    tokenName: tokenData.name,
    tokenTicker: tokenData.ticker,
    tokenImage: tokenData.logo,
    processId: tokenId,
    denomination: tokenData.denomination.toString()
  }
}

function decodeTokenDetailsFromMessage(msg: any) {
  const tags = msg.Tags as Tag[]
  const tagsToPick = ['Name', 'Ticker', 'Denomination', 'Logo']

  const tokenData = tags.reduce((acc, curr) => {
    if (tagsToPick.includes(curr.name)) {
      const key = curr.name.toLowerCase()
      acc[key] = curr.value
    }

    return acc
  }, {} as any)

  return tokenData
}
