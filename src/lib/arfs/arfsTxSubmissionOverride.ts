import Transaction from 'arweave/web/lib/transaction'
import { v4 as uuidv4 } from 'uuid'

import { createSignedQueuePayload } from '../queue/helpers'
import taskQueueSingleton from '../queue/TaskQueue'

export async function arfsTxSubmissionOverride(txList: Transaction[]) {
  const queueStatus = taskQueueSingleton.getTaskQueueStatus()
  const txIds: string[] = []

  if (queueStatus === 'Busy') throw new Error('Task Queue is busy. Try again later.')

  for (const tx of txList) {
    const dataItem = await createSignedQueuePayload(tx)

    const token = uuidv4()
    taskQueueSingleton.sendToPending(token, dataItem)

    const txid = await dataItem.id
    txIds.push(txid)
  }

  return { successTxIds: txIds, failedTxIndex: [] }
}
