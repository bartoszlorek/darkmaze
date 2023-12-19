import * as React from "react";

export function useDialog<T extends string>(
  defs: Record<T, string>
): [string | null, (key: T) => void] {
  const [key, setKey] = React.useState<T | null>(null);
  const value = key !== null ? defs[key] : null;
  const setter = React.useCallback((key: T) => setKey(key), []);

  return [value, setter];
}
