import Transaction from 'arweave/web/lib/transaction'
import axios from 'axios'
import { DataItem } from 'warp-arbundles'

import { useGlobalStore } from '@/stores/globalStore'

import { bundleAndSignData } from '../subsidize/utils'
import { PendingObserver, PendingQueue } from './PendingQueue'

export const MAX_LENGTH_PROGRESS_QUEUE = 5

let instance: TaskQueueSingleton
let taskQueueStatus: 'Busy' | 'Idle' = 'Idle'
export class TaskQueueSingleton {
  pendingQueue = new PendingQueue<Transaction | DataItem>()

  constructor() {
    if (instance) {
      throw new Error('You can only create one instance!')
    }

    this.pendingQueue.addObserver(new PendingObserver())
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    instance = this
  }

  getInstance() {
    return this
  }

  getTaskQueueStatus() {
    return taskQueueStatus
  }

  setTaskQueueStatus(status: 'Busy' | 'Idle') {
    taskQueueStatus = status
  }

  sendToPending(token: string, tx: Transaction | DataItem) {
    this.pendingQueue.enqueue(token, tx)
    this.pendingQueue.notifyObservers({ token, payload: tx })
  }

  getPending() {
    return this.pendingQueue.getList()
  }

  async execute(driveId: string) {
    if (taskQueueStatus === 'Busy') {
      //toast message notify that new batch cant be run
      return []
    }

    taskQueueStatus = 'Busy'

    const dataItems = []
    const ids = []
    let bundle: Awaited<ReturnType<typeof bundleAndSignData>> | null = null

    try {
      while (this.pendingQueue.getList().length > 0) {
        const item = this.pendingQueue.dequeue()

        if (item) {
          const { payload } = item

          dataItems.push(payload as DataItem)
          ids.push(await payload.id)
        }
      }

      bundle = await bundleAndSignData(dataItems, () => console.log('error: unsigned data items.'))
    } catch (error) {
      taskQueueStatus = 'Idle'

      return []
    }

    const userAddress = useGlobalStore.getState().authState.address
    if (!bundle || !userAddress) {
      taskQueueStatus = 'Idle'

      return []
    }

    try {
      const dataBinary = bundle.getRaw()
      const res = (
        await axios.post(
          'https://bundle.saikranthi.dev/api/v1/postrepo',
          {
            txBundle: dataBinary,
            platform: 'UI',
            owner: userAddress!,
            driveId
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            }
          }
        )
      ).data

      if (!res || !res.success) {
        throw new Error('Failed to subsidize your transaction. Please try again.')
      }

      return ids
    } catch (error: any) {
      taskQueueStatus = 'Idle'

      return []
    } finally {
      taskQueueStatus = 'Idle'
    }
  }
}

const taskQueueSingleton = Object.freeze(new TaskQueueSingleton())
export default taskQueueSingleton
