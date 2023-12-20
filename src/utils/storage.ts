export function accessLocalStorage<T extends Record<string, unknown>>(
  key: string
) {
  function getValue(): Partial<T> {
    try {
      const storedValues = localStorage.getItem(key);
      const parsedValues = storedValues ? JSON.parse(storedValues) : null;

      if (parsedValues) {
        return parsedValues as T;
      }

      return {};
    } catch {
      return {};
    }
  }

  function setValue(value: Partial<T>) {
    try {
      const nextValue = { ...getValue(), ...value };
      localStorage.setItem(key, JSON.stringify(nextValue));
    } catch {}
  }

  return {
    getValue,
    setValue,
  };
}
