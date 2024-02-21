export interface MarginObject {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export class FrameBounds {
  top: number = 0;
  left: number = 0;
  right: number = 0;
  bottom: number = 0;
  width: number = 0;
  height: number = 0;

  // as tiles
  tilesCountX: number = 0;
  tilesCountY: number = 0;

  update(tileSize: number, margin: MarginObject) {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    const marginX = margin.left + margin.right;
    const marginY = margin.top + margin.bottom;
    const marginLeftScale = margin.left / marginX;
    const marginTopScale = margin.top / marginY;

    this.tilesCountX = Math.floor((maxWidth - marginX) / tileSize);
    this.tilesCountY = Math.floor((maxHeight - marginY) / tileSize);
    this.width = this.tilesCountX * tileSize;
    this.height = this.tilesCountY * tileSize;

    const actualMarginLeft = Math.floor(
      (maxWidth - this.width) * marginLeftScale
    );
    const actualMarginTop = Math.floor(
      (maxHeight - this.height) * marginTopScale
    );

    this.top = actualMarginTop;
    this.left = actualMarginLeft;
    this.right = actualMarginLeft + this.width;
    this.bottom = actualMarginTop + this.height;
    return this;
  }
}
