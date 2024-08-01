export abstract class QueueObserver<T> {
  abstract update(item: { token: string; payload: T }): void
}
