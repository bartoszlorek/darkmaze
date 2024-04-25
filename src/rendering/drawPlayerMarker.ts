import * as PIXI from "pixi.js";
import { DrawFunction, noop } from "./draw";
import { FrameBounds } from "./FrameBounds";

export const drawPlayerMarker: DrawFunction<{
  frame: FrameBounds;
  tileSize: number;
}> = ({ parent, frame, tileSize }) => {
  const marker = new PIXI.Graphics();
  marker.beginFill(0x84aea4);
  marker.drawCircle(0, 0, 4);
  parent.addChild(marker);

  return [
    () => {
      marker.x = frame.centerX;
      marker.y = frame.centerY + tileSize / 4;
    },
    noop,
  ];
};
