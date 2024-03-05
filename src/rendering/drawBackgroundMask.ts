import * as PIXI from "pixi.js";
import { DrawFunction } from "./draw";
import { FrameBounds } from "./FrameBounds";

export const drawBackgroundMask: DrawFunction<{
  frame: FrameBounds;
  tileSize: number;
}> = ({ parent, frame, tileSize }) => {
  const mask = new PIXI.Graphics();
  parent.mask = mask;

  return () => {
    mask
      .clear()
      .beginFill(0xffffff)
      .drawRect(
        frame.left + tileSize,
        frame.top + tileSize,
        frame.width - tileSize * 2,
        frame.height - tileSize * 2
      );
  };
};
