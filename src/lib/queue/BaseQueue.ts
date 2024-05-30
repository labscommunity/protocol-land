import { QueueObserver } from './QueueObserver'

export class BaseQueue<T> {
  public list: Array<{ token: string; payload: T }> = []
  protected addedList: Record<string, string> = {}
  private observers: QueueObserver<T>[] = []

  constructor() {}

  public enqueue(token: string, payload: T) {
    if (!this.isInList(token)) {
      this.list.unshift({ token, payload })
      this.addedList[token] = token
    }
  }

  public dequeue(token?: string) {
    // you can pass token for removing specific item
    if (token) {
      const itemShouldRemove = this.list.find((item) => item.token === token)
      this.list = this.list.filter((item) => item.token !== token)

      delete this.addedList[token]

      return itemShouldRemove
    } else {
      const item = this.list.pop()

      if (item) delete this.addedList[item?.token]

      return item
    }
  }

  public isInList(token: string) {
    return token in this.addedList
  }

  public addObserver(observer: QueueObserver<T>) {
    this.observers.push(observer)
  }

  public notifyObservers(item: { token: string; payload: T }) {
    for (const observer of this.observers) {
      observer.update(item)
    }
  }

  public getList() {
    return this.list
  }
}
