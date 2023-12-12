import * as PIXI from "pixi.js";
import type { DrawFunction } from "./utils";
import type { Level } from "./Level";

const lineStyleOptions = {
  width: 4,
  color: "#646365",
  cap: PIXI.LINE_CAP.SQUARE,
};

export const drawLevel: DrawFunction<{
  level: Level;
  gridSize: number;
}> = ({ parent, level, gridSize }) => {
  const g = new PIXI.Graphics();
  parent.addChild(g);

  return () => {
    g.clear();
    g.lineStyle(lineStyleOptions);

    for (let i = 0; i < level.rooms.length; i++) {
      const room = level.rooms[i];
      if (!room.explored) {
        continue;
      }

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

      if (room.type === "passage") {
        g.drawCircle(left + gridSize / 2, top + gridSize / 2, gridSize * 0.25);
      } else if (room.type === "evil") {
        g.drawRect(
          left + gridSize * 0.25,
          top + gridSize * 0.25,
          gridSize / 2,
          gridSize / 2
        );
      }
    }
  };
};
