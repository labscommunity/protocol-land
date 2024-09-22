import Transaction from 'arweave/web/lib/transaction'
import { DataItem } from 'warp-arbundles'

import { BaseQueue } from './BaseQueue'
import { QueueObserver } from './QueueObserver'

export class PendingQueue<T> extends BaseQueue<T> {}

export class PendingObserver implements QueueObserver<Transaction | DataItem> {
  update(item: { token: string; payload: Transaction | DataItem }) {
    console.log({ item }, '<-- added to queue')
    //check for progress queue length and move items from pending to progress
  }
}
