export enum DEBUG_MODE {
  NONE = 0,
  ROOMS_LAYOUT = 1,
  VISITED_CONNECTED = 2,
  WALLS_INDEX = 3,
  FLOOR_INDEX = 4,
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
