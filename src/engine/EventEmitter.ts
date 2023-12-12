import { arrayRemove } from "../utils";

export type EventHandler<T> = (value: T) => void;

export class EventEmitter<T extends Record<string, unknown>> {
  protected registry: Map<keyof T, EventHandler<T[keyof T]>[]> = new Map();

  emit<K extends keyof T>(event: K, value: T[K]) {
    const handlers = this.registry.get(event);

    if (handlers) {
      if (handlers.length === 1) {
        handlers[0](value);
      } else {
        for (let i = 0; i < handlers.length; i++) {
          handlers[i](value);
        }
      }
    }
  }

  subscribe<K extends keyof T>(event: K, handler: EventHandler<T[K]>) {
    const handlers = this.registry.get(event) || [];

    this.registry.set(event, handlers);
    handlers.push(handler as EventHandler<T[keyof T]>);
    return () => this.unsubscribe(event, handler);
  }

  unsubscribe<K extends keyof T>(event: K, handler: EventHandler<T[K]>) {
    const handlers = this.registry.get(event) || [];

    this.registry.set(event, handlers);
    arrayRemove(handlers, handler);
  }
}
