import { arweaveInstance } from './getArweaveInstance'
import { waitFor } from './waitFor'

interface PollingOptions {
  maxAttempts?: number
  pollingIntervalMs?: number
  initialBackoffMs?: number
}

interface TagCriteria {
  name: string
  value: string
}

export async function pollForMessage(msgId: string, tagCriteria: TagCriteria[], options: PollingOptions = {}) {
  const { maxAttempts = 50, pollingIntervalMs = 3_000, initialBackoffMs = 7_000 } = options

  console.log('Polling for transaction...', { msgId, tagCriteria })
  await waitFor(initialBackoffMs)

  let attempts = 0
  while (attempts < maxAttempts) {
    let transaction
    attempts++

    try {
      const response = await arweaveInstance.api.post('/graphql', {
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
      console.log('Failed to poll for transaction...', { err })
      // Continue retries when request errors
      continue
    }

    if (transaction) {
      const messages = transaction.edges.map((edge: any) => edge.node)

      for (const msg of messages) {
        const allTagsMatch = tagCriteria.every((criteria) =>
          msg.tags.some((tag: any) => tag.name === criteria.name && tag.value === criteria.value)
        )

        if (allTagsMatch) {
          return { success: true, message: msg }
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
