import * as React from "react";

export function useInstance<T>(creator: () => T) {
  const instanceRef = React.useRef<T>();

  if (!instanceRef.current) {
    instanceRef.current = creator();
  }

  return instanceRef.current;
}
