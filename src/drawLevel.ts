import * as PIXI from "pixi.js";
import type { DrawFunction } from "./helpers";
import type { Level } from "./core";

const lineStyleOptions = {
  width: 4,
  color: 0x2a173b,
  cap: PIXI.LINE_CAP.SQUARE,
};

export const drawLevel: DrawFunction<
  { level: Level; gridSize: number },
  [revealed: boolean]
> = ({ parent, level, gridSize }) => {
  const back = new PIXI.Graphics();
  const front = new PIXI.Graphics();
  parent.addChild(back);
  parent.addChild(front);

  return (revealed) => {
    front.clear();

    for (let i = 0; i < level.rooms.length; i++) {
      const room = level.rooms[i];
      const left = room.x * gridSize;
      const top = room.y * gridSize;
      const right = left + gridSize;
      const bottom = top + gridSize;

      if (room.visited) {
        drawVisited(back, left, top, gridSize);
      }

      if (!revealed) {
        if (room.type === "start") {
          if (room.visitedNeighbors < 1) {
            continue;
          }
        } else if (room.deadEnd) {
          if (!room.visited) {
            continue;
          }
        } else {
          if (room.visitedNeighbors < 2) {
            continue;
          }
        }
      }

      front.lineStyle(lineStyleOptions);

      if (room.walls[0]) {
        front.moveTo(left, top);
        front.lineTo(right, top);
      }

      if (room.walls[1]) {
        front.moveTo(right, top);
        front.lineTo(right, bottom);
      }

      if (room.walls[2]) {
        front.moveTo(left, bottom);
        front.lineTo(right, bottom);
      }

      if (room.walls[3]) {
        front.moveTo(left, bottom);
        front.lineTo(left, top);
      }

      switch (room.type) {
        case "evil":
          drawEvil(front, left, top, gridSize);
          break;

        case "golden":
          drawGolden(front, left, top, gridSize);
          break;

        case "passage":
          drawPassage(front, left, top, gridSize);
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
    .beginFill(0x2a173b)
    .drawRect(x + size * 0.25, y + size * 0.25, size / 2, size / 2)
    .endFill();
}

function drawVisited(g: PIXI.Graphics, x: number, y: number, size: number) {
  g.lineStyle(0).beginFill(0x3f2c5f).drawRect(x, y, size, size).endFill();
}
