import { arGql, GQLUrls } from 'ar-gql'
import Arweave from 'arweave'
import BigNumber from 'bignumber.js'

import { getTags } from '@/helpers/getTags'
import { waitFor } from '@/helpers/waitFor'
import { CurveState } from '@/stores/repository-core/types'

import { sendMessage } from '../contract'
import { pollForTxBeingAvailable } from '../decentralize'
import { CurveStep } from '../discrete-bonding-curve/curve'

const arweave = new Arweave({
  host: 'arweave-search.goldsky.com',
  port: 443,
  protocol: 'https'
})
const goldsky = arGql({ endpointUrl: GQLUrls.goldsky })

export async function getTokenBuyPrice(amount: string, currentSupply: string, curveState: CurveState) {
  let currentSupplyBn = BigNumber(currentSupply)
  const amountBn = BigNumber(amount).multipliedBy(BigNumber(10).pow(BigNumber(curveState.repoToken.denomination)))

  const newSupply = currentSupplyBn.plus(amountBn)
  const maxSupply = BigNumber(curveState.maxSupply)

  if (newSupply.isGreaterThan(maxSupply)) {
    throw new Error('Purchase would exceed maximum supply')
  }

  // Get curve steps from state
  const steps = curveState.steps.map((step) => ({
    rangeTo: BigNumber(step.rangeTo),
    price: +step.price
  }))

  let supplyLeft
  let tokensLeftBn = amountBn
  let reserveToBondBn = BigNumber(0)

  for (const step of steps) {
    if (currentSupplyBn.isLessThanOrEqualTo(step.rangeTo)) {
      supplyLeft = step.rangeTo.minus(currentSupplyBn)

      if (supplyLeft.isLessThan(tokensLeftBn)) {
        if (supplyLeft.isEqualTo(0)) {
          continue
        }

        reserveToBondBn = reserveToBondBn.plus(supplyLeft.multipliedBy(step.price))
        currentSupplyBn = currentSupplyBn.plus(supplyLeft)
        tokensLeftBn = tokensLeftBn.minus(supplyLeft)
      } else {
        reserveToBondBn = reserveToBondBn.plus(tokensLeftBn.times(BigNumber(step.price)))
        tokensLeftBn = BigNumber(0)
        break
      }
    }
  }

  if (reserveToBondBn.isEqualTo(0) || tokensLeftBn.isGreaterThan(0)) {
    throw new Error('Invalid tokens quantity.')
  }

  return reserveToBondBn.dividedBy(BigNumber(10).pow(BigNumber(curveState.repoToken.denomination))).toString()
}

export async function getTokenSellPrice(amount: string, currentSupply: string, curveState: CurveState) {
  let currentSupplyBn = BigNumber(currentSupply)
  const amountBn = BigNumber(amount).multipliedBy(BigNumber(10).pow(BigNumber(curveState.repoToken.denomination)))

  let tokensLeftBn = amountBn
  let currentStepIdx = 0

  const steps = curveState.steps.map((step) => ({
    rangeTo: BigNumber(step.rangeTo),
    price: +step.price
  }))

  // Find current step index by comparing current supply with step ranges
  for (let i = 0; i < steps.length; i++) {
    if (currentSupplyBn.isLessThanOrEqualTo(steps[i].rangeTo)) {
      currentStepIdx = i
      break
    }
  }

  let reserveFromBondBn = BigNumber(0)

  while (tokensLeftBn.isGreaterThan(0)) {
    let supplyLeft = currentSupplyBn

    if (currentStepIdx > 0) {
      supplyLeft = currentSupplyBn.minus(steps[currentStepIdx - 1].rangeTo)
    }

    let tokensToHandle = supplyLeft
    if (tokensLeftBn.isLessThan(supplyLeft)) {
      tokensToHandle = tokensLeftBn
    }

    reserveFromBondBn = reserveFromBondBn.plus(tokensToHandle.multipliedBy(steps[currentStepIdx].price))
    tokensLeftBn = tokensLeftBn.minus(tokensToHandle)
    currentSupplyBn = currentSupplyBn.minus(tokensToHandle)

    if (currentStepIdx > 0) {
      currentStepIdx = currentStepIdx - 1
    }
  }

  if (reserveFromBondBn.isEqualTo(0) || tokensLeftBn.isGreaterThan(0)) {
    throw new Error('Invalid tokens quantity.')
  }

  return reserveFromBondBn.dividedBy(BigNumber(10).pow(BigNumber(curveState.repoToken.denomination))).toString()
}

export async function getTokenNextBuyPrice(currentSupply: string, curveState: CurveState) {
  if (!curveState || !curveState.steps) return '0'
  let currentSupplyBn = BigNumber(currentSupply)
  const maxSupplyBn = BigNumber(curveState.maxSupply)

  // Get curve steps from state
  const steps = curveState.steps.map((step) => ({
    rangeTo: BigNumber(step.rangeTo),
    price: +step.price
  }))

  if (currentSupplyBn.isLessThan(maxSupplyBn)) {
    currentSupplyBn = currentSupplyBn.plus(
      BigNumber(1).multipliedBy(BigNumber(10).pow(BigNumber(curveState.repoToken.denomination)))
    )
  }

  let nextPrice = BigNumber(0)

  for (const step of steps) {
    if (currentSupplyBn.isLessThanOrEqualTo(step.rangeTo)) {
      nextPrice = BigNumber(step.price)
      break
    }
  }

  return nextPrice.toString()
}

export async function getCurrentStep(currentSupply: string, steps: CurveStep[]) {
  const currentSupplyBn = BigNumber(currentSupply)

  const stepsBn = steps.map((step) => ({
    rangeTo: BigNumber(step.rangeTo),
    price: +step.price
  }))

  for (let i = 0; i < stepsBn.length; i++) {
    if (currentSupplyBn.isLessThanOrEqualTo(stepsBn[i].rangeTo)) {
      return i
    }
  }

  return 0
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
