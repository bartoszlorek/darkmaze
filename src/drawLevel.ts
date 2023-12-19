import * as PIXI from "pixi.js";
import type { DrawFunction } from "./utils";
import type { Level } from "./Level";

const lineStyleOptions = {
  width: 4,
  color: 0x646365,
  cap: PIXI.LINE_CAP.SQUARE,
};

export const drawLevel: DrawFunction<
  { level: Level; gridSize: number },
  [debug: boolean]
> = ({ parent, level, gridSize }) => {
  const g = new PIXI.Graphics();
  parent.addChild(g);

  return (debug) => {
    g.clear();

    for (let i = 0; i < level.rooms.length; i++) {
      const room = level.rooms[i];
      if (!room.explored && !debug) {
        continue;
      }

      const left = room.x * gridSize;
      const top = room.y * gridSize;
      const right = left + gridSize;
      const bottom = top + gridSize;

      g.lineStyle(lineStyleOptions);

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

      switch (room.type) {
        case "evil":
          drawEvil(g, left, top, gridSize);
          break;

        case "golden":
          drawGolden(g, left, top, gridSize);
          break;

        case "passage":
          drawPassage(g, left, top, gridSize);
          break;
      }
    }
  };
};

function drawEvil(g: PIXI.Graphics, x: number, y: number, size: number) {
  g.lineStyle(0)
    .beginFill(0xb45252)
    .drawCircle(x + size / 2, y + size / 2, size * 0.25)
    .endFill();
}

function drawGolden(g: PIXI.Graphics, x: number, y: number, size: number) {
  g.lineStyle(0)
    .beginFill(0xede19e)
    .drawCircle(x + size / 2, y + size / 2, size * 0.25)
    .endFill();
}

function drawPassage(g: PIXI.Graphics, x: number, y: number, size: number) {
  g.lineStyle(0)
    .beginFill(0x646365)
    .drawRect(x + size * 0.25, y + size * 0.25, size / 2, size / 2)
    .endFill();
}
