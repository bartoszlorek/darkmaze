import * as PIXI from "pixi.js";
import type { FrameBounds } from "./FrameBounds";

export class FrameMask extends PIXI.Graphics {
  public frame: FrameBounds;

  constructor(frame: FrameBounds) {
    super();
    this.frame = frame;
  }

  redraw() {
    this.clear();
    this.beginFill(0xffffff);
    this.drawRect(
      this.frame.left + this.frame.tileSize,
      this.frame.top + this.frame.tileSize,
      this.frame.width - this.frame.tileSize * 2,
      this.frame.height - this.frame.tileSize * 2
    );
  }
}
