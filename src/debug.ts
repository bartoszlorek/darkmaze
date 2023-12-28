export enum DEBUG_MODE {
  none = 0,
  layout = 1,
  visited = 2,
}

export function getDebugMode(): DEBUG_MODE {
  const parsed = new URL(document.location.href);
  const debugParam = parsed.searchParams.get("debug");

  if (debugParam !== null) {
    const debugNum = Number(debugParam);

    if (Object.values(DEBUG_MODE).includes(debugNum)) {
      return debugNum as DEBUG_MODE;
    }
  }

  return DEBUG_MODE.none;
}
