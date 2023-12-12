export type EventCallback = (pressed: boolean) => void;

export class Keyboard<Key extends string = string> {
  protected states: Map<Key, boolean>;
  protected events: Map<Key, EventCallback>;
  protected handler?: (event: KeyboardEvent) => void;

  constructor() {
    this.states = new Map();
    this.events = new Map();
  }

  public on(keys: Key[], callback: EventCallback) {
    keys.forEach((key) => this.events.set(key, callback));

    if (this.handler === undefined) {
      this.registerHandler();
    }
  }

  public off(keys: Key[]) {
    keys.forEach((key) => this.events.delete(key));

    if (this.events.size === 0) {
      this.unregisterHandler();
    }
  }

  public destroy() {
    this.unregisterHandler();
    this.states.clear();
    this.events.clear();
  }

  protected registerHandler() {
    const handler = (event: KeyboardEvent) => {
      event.preventDefault();

      const key = event.key as Key;
      const pressed = event.type === "keydown";

      if (!this.events.has(key)) {
        return;
      }

      // should not invoke keyup before keydown
      if (!pressed && !this.states.get(key)) {
        return;
      }

      if (this.states.get(key) !== pressed) {
        this.states.set(key, pressed);
        this.events.get(key)?.(pressed);
      }
    };

    this.unregisterHandler();
    this.handler = handler;
    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", handler);
  }

  protected unregisterHandler() {
    if (this.handler !== undefined) {
      window.removeEventListener("keydown", this.handler);
      window.removeEventListener("keyup", this.handler);
      this.handler = undefined;
    }
  }
}
