export class Pool<T> {
  public values: Map<string, T> = new Map();
  public usedKeys: Set<string> = new Set();
  public fallback: () => T;
  public cleanup?: (value: T) => void;

  constructor(fallback: () => T, cleanup?: (value: T) => void) {
    this.fallback = fallback;
    this.cleanup = cleanup;
  }

  get(key: string) {
    this.usedKeys.add(key);

    const value = this.values.get(key);
    if (value !== undefined) {
      return value;
    }

    const nextValue = this.fallback();
    this.values.set(key, nextValue);
    return nextValue;
  }

  afterAll() {
    for (const [key, value] of this.values.entries()) {
      if (!this.usedKeys.has(key)) {
        this.values.delete(key);
        this.cleanup?.(value);
      }
    }

    this.usedKeys.clear();
  }
}
