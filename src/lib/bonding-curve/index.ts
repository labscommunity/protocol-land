import { dryrun } from '@permaweb/aoconnect'
import { arGql, GQLUrls } from 'ar-gql'
import Arweave from 'arweave'

import { getTags } from '@/helpers/getTags'
import { waitFor } from '@/helpers/waitFor'

import { sendMessage } from '../contract'
import { pollForTxBeingAvailable } from '../decentralize'

const arweave = new Arweave({
  host: 'arweave-search.goldsky.com',
  port: 443,
  protocol: 'https'
})
const goldsky = arGql({ endpointUrl: GQLUrls.goldsky })
export async function getTokenBuyPrice(amount: string, currentSupply: string, cruveId: string) {
  const args = {
    tags: getTags({
      Action: 'Get-Buy-Price',
      'Token-Quantity': amount,
      'Current-Supply': currentSupply
    }),
    process: cruveId
  }
  const { Messages } = await dryrun(args)

  if (!Messages || !Messages[0]) {
    throw new Error('Failed to get token buy price')
  }

  const cost = Messages[0].Data

  if (!cost) {
    throw new Error('Failed to get token buy price')
  }

  return parseInt(cost)
}

const GET_BUY_PRICE_RESPONSE_ACTION = 'Get-Buy-Price-Response'
const GET_BUY_PRICE_ERROR_ACTION = 'Get-Buy-Price-Error'

export async function pollGetBuyPriceMessages(msgId: string) {
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
        const getBuyPriceErrorMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === GET_BUY_PRICE_ERROR_ACTION
        )

        if (getBuyPriceErrorMessage) {
          const errMessage = msg.tags.find((tag: any) => tag.name === 'Error')?.value

          return { cost: null, message: errMessage }
        }

        const getBuyPriceResponseMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === GET_BUY_PRICE_RESPONSE_ACTION
        )

        if (getBuyPriceResponseMessage) {
          const price = msg.tags.find((tag: any) => tag.name === 'Price')?.value
          console.log({ price })
          return { cost: price }
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

const BUY_TOKENS_RESPONSE_ACTION = 'Buy-Tokens-Response'
const BUY_TOKENS_ERROR_ACTION = 'Buy-Tokens-Error'

export async function pollBuyTokensMessages(msgId: string) {
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
        const buyTokensErrorMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === BUY_TOKENS_ERROR_ACTION
        )

        if (buyTokensErrorMessage) {
          const errMessage = msg.tags.find((tag: any) => tag.name === 'Error')?.value

          return { success: false, message: errMessage }
        }

        const buyTokensResponseMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === BUY_TOKENS_RESPONSE_ACTION
        )

        if (buyTokensResponseMessage) {
          const data = msg.tags.find((tag: any) => tag.name === 'Data')?.value
          return { success: true, message: data }
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

const SELL_TOKENS_RESPONSE_ACTION = 'Sell-Tokens-Response'
const SELL_TOKENS_ERROR_ACTION = 'Sell-Tokens-Error'

export async function pollSellTokensMessages(msgId: string) {
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
        const sellTokensErrorMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === SELL_TOKENS_ERROR_ACTION
        )

        if (sellTokensErrorMessage) {
          const errMessage = msg.tags.find((tag: any) => tag.name === 'Error')?.value

          return { success: false, message: errMessage }
        }

        const sellTokensResponseMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === SELL_TOKENS_RESPONSE_ACTION
        )

        if (sellTokensResponseMessage) {
          const data = msg.tags.find((tag: any) => tag.name === 'Data')?.value
          return { success: true, message: data }
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

const DEPOSIT_TO_LIQUIDITY_POOL_RESPONSE_ACTION = 'Deposit-To-Liquidity-Pool-Response'
const DEPOSIT_TO_LIQUIDITY_POOL_ERROR_ACTION = 'Deposit-To-Liquidity-Pool-Error'

export async function pollDepositToLiquidityPoolMessages(msgId: string) {
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
        const depositToLiquidityPoolErrorMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === DEPOSIT_TO_LIQUIDITY_POOL_ERROR_ACTION
        )

        if (depositToLiquidityPoolErrorMessage) {
          const errMessage = msg.tags.find((tag: any) => tag.name === 'Error')?.value

          return { success: false, message: errMessage }
        }

        const depositToLiquidityPoolResponseMessage = msg.tags.find(
          (tag: any) => tag.name === 'Action' && tag.value === DEPOSIT_TO_LIQUIDITY_POOL_RESPONSE_ACTION
        )

        if (depositToLiquidityPoolResponseMessage) {
          const data = msg.tags.find((tag: any) => tag.name === 'Data')?.value
          return { success: true, message: data }
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

export async function getBuySellTransactionsOfCurve(curveId: string) {
  const queryObject = prepareBuySellTransactionsQueryObject()
  const edges = await goldsky.all(queryObject.query, {
    sortOrder: 'HEIGHT_ASC',
    action: [BUY_TOKENS_RESPONSE_ACTION, SELL_TOKENS_RESPONSE_ACTION],
    curveId
  })

  return edges
}

const prepareBuySellTransactionsQueryObject = () => {
  return {
    query: `
     query($cursor: String, $sortOrder: SortOrder!, $action: [String!], $curveId: [String!]) {
      transactions(
        first: 100
        after: $cursor
        sort: $sortOrder
        tags: [
          { name: "Action", values: $action }
          { name: "From-Process", values: $curveId }
        ]
      ) {
        pageInfo {
          hasNextPage
        }
        edges {
          node {
            ...TransactionCommon
          }
        }
      }
    }
    fragment TransactionCommon on Transaction {
      id
      ingested_at
      recipient
      block {
        height
        timestamp
      }
      tags {
        name
        value
      }
    }
    `
  }
}

export async function depositToLPFromBondingCurve(poolId: string, bondingCurveId: string) {
  const args = {
    tags: getTags({
      Action: 'Deposit-To-Liquidity-Pool',
      'Pool-Id': poolId
    }),
    pid: bondingCurveId
  }

  const msgId = await sendMessage(args)
  await pollForTxBeingAvailable({ txId: msgId })

  const poolStatus = await pollDepositToLiquidityPoolMessages(msgId)

  return poolStatus
}
