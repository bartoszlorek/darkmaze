export interface FrameBounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
  tilesX: number;
  tilesY: number;
}

export function createFrameBounds(
  output: FrameBounds,
  tileSize: number,
  margin: number = 0
): FrameBounds {
  const maxWidth = window.innerWidth;
  const maxHeight = window.innerHeight;

  const tilesX = Math.floor((maxWidth - margin * 2) / tileSize);
  const tilesY = Math.floor((maxHeight - margin * 2) / tileSize);

  const width = tilesX * tileSize;
  const height = tilesY * tileSize;

  const actualMarginX = Math.round((maxWidth - width) / 2);
  const actualMarginY = Math.round((maxHeight - height) / 2);

  output.top = actualMarginY;
  output.left = actualMarginX;
  output.right = actualMarginX + width;
  output.bottom = actualMarginY + height;
  output.tilesX = tilesX;
  output.tilesY = tilesY;
  return output;
}

export function createEmptyFrameBounds(): FrameBounds {
  return {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    tilesX: 0,
    tilesY: 0,
  };
}
