import * as React from "react";
import { accessLocalStorage } from "./utils";

type StorageType = Readonly<{
  debug: boolean;
}>;

export function useDebug() {
  const debug = React.useMemo(() => {
    const storage = accessLocalStorage<StorageType>("darkmaze");
    return storage.getValue().debug ?? false;
  }, []);

  return debug;
}
