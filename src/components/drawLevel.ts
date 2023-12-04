import * as PIXI from "pixi.js";
import type { Level } from "../Level";
import type { DrawFunction } from "./draw";

export const drawLevel: DrawFunction<{
  level: Level;
  gridSize: number;
}> = ({ parent, level, gridSize }) => {
  const g = new PIXI.Graphics();

  g.lineStyle(4, "#5f5854");
  level.rooms.forEach((room) => {
    const left = room.x * gridSize;
    const top = room.y * gridSize;
    const right = left + gridSize;
    const bottom = top + gridSize;

    if (room.walls[0]) {
      g.moveTo(left, top);
      g.lineTo(right, top);
    }

    if (room.walls[1]) {
      g.moveTo(right, top);
      g.lineTo(right, bottom);
    }

    if (room.walls[2]) {
      g.moveTo(left, bottom);
      g.lineTo(right, bottom);
    }

    if (room.walls[3]) {
      g.moveTo(left, bottom);
      g.lineTo(left, top);
    }
  });

  parent.addChild(g);
  return () => undefined;
};
