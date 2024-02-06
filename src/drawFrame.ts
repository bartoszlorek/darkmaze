import * as PIXI from "pixi.js";
import { LoadedSpritesheets } from "./assets";
import { DrawFunction } from "./helpers";

export const drawFrame: DrawFunction<{
  gridSize: number;
  sprites: LoadedSpritesheets;
}> = ({ gridSize, parent }) => {
  const g = new PIXI.Graphics();
  parent.addChild(g);

  return () => {
    g.clear();
    g.lineStyle(2, 0x3c566c);
    g.moveTo(gridSize, gridSize);
    g.lineTo(window.innerWidth - gridSize, gridSize);
    g.lineTo(window.innerWidth - gridSize, window.innerHeight - gridSize);
    g.lineTo(gridSize, window.innerHeight - gridSize);
    g.closePath();
  };
};
