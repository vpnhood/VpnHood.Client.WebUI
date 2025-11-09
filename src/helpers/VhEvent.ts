type EventHandler<T> = (arg: T) => void;

export class VhEvent<T> {
  private handlers: EventHandler<T>[] = [];

  subscribe(handler: EventHandler<T>): void {
    this.handlers.push(handler);
  }

  unsubscribe(handler: EventHandler<T>): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  emit(arg: T): void {
    for (const handler of this.handlers)
      handler(arg);
  }
}