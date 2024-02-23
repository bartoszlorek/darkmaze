import type { MarginObject } from "../margin";

export class FrameBounds {
  top: number = 0;
  left: number = 0;
  right: number = 0;
  bottom: number = 0;
  width: number = 0;
  height: number = 0;

  // margin
  actualMarginTop: number = 0;
  actualMarginLeft: number = 0;
  actualMarginRight: number = 0;
  actualMarginBottom: number = 0;

  // tiles
  tilesCountX: number = 0;
  tilesCountY: number = 0;
  tileSize: number;

  constructor(tileSize: number, margin: MarginObject) {
    this.tileSize = tileSize;
    this.update(margin);
  }

  update(margin: MarginObject) {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;
    const marginX = margin.left + margin.right;
    const marginY = margin.top + margin.bottom;
    const marginLeftRatio = margin.left / marginX;
    const marginTopRatio = margin.top / marginY;

    this.tilesCountX = Math.floor((maxWidth - marginX) / this.tileSize);
    this.tilesCountY = Math.floor((maxHeight - marginY) / this.tileSize);
    this.width = this.tilesCountX * this.tileSize;
    this.height = this.tilesCountY * this.tileSize;

    this.actualMarginLeft = Math.floor(
      (maxWidth - this.width) * marginLeftRatio
    );
    this.actualMarginTop = Math.floor(
      (maxHeight - this.height) * marginTopRatio
    );

    this.top = this.actualMarginTop;
    this.left = this.actualMarginLeft;
    this.right = this.actualMarginLeft + this.width;
    this.bottom = this.actualMarginTop + this.height;

    this.actualMarginRight = maxWidth - this.right;
    this.actualMarginBottom = maxHeight - this.bottom;
    return this;
  }
}
