export enum DEBUG_MODE {
  NONE = 0,
  ROOMS_LAYOUT = 1,
  VISITED_ADJACENT = 2,
  VISITED_CONNECTED = 3,
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

  return DEBUG_MODE.NONE;
}
