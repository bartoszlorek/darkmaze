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

  update(tileSize: number, margin: number = 0) {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    this.tilesCountX = Math.floor((maxWidth - margin * 2) / tileSize);
    this.tilesCountY = Math.floor((maxHeight - margin * 2) / tileSize);
    this.width = this.tilesCountX * tileSize;
    this.height = this.tilesCountY * tileSize;

    const actualMarginX = Math.round((maxWidth - this.width) / 2);
    const actualMarginY = Math.round((maxHeight - this.height) / 2);

    this.top = actualMarginY;
    this.left = actualMarginX;
    this.right = actualMarginX + this.width;
    this.bottom = actualMarginY + this.height;
    return this;
  }
}
