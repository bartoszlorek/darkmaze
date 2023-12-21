// https://www.w3schools.com/js/js_json_datatypes.asp
type JSONValue = string | number | boolean | JSONObject | JSONValue[] | null;
type JSONObject = { [key: string]: JSONValue };

export function accessLocalStorage<T extends Record<string, JSONValue>>(
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
