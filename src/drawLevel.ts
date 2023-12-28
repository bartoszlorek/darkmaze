import * as PIXI from "pixi.js";
import { DEBUG_MODE } from "./debug";
import type { DrawFunction } from "./helpers";
import type { Level } from "./core";

const lineStyleOptions = {
  width: 4,
  color: 0x2a173b,
  cap: PIXI.LINE_CAP.SQUARE,
};

const textStyleOptions = {
  fontFamily: "Arial",
  fontSize: 16,
  fill: 0xffffff,
  align: "center",
} as const;

export const drawLevel: DrawFunction<
  {
    level: Level;
    gridSize: number;
    debug: DEBUG_MODE;
  },
  [revealed: boolean]
> = ({ parent, level, gridSize, debug }) => {
  const back = new PIXI.Graphics();
  const front = new PIXI.Graphics();
  const texts = new PIXI.Container();
  parent.addChild(back);
  parent.addChild(front);
  parent.addChild(texts);

  const textRefs: PIXI.Text[] = [];
  if (debug === DEBUG_MODE.visited) {
    for (const room of level.rooms) {
      const text = new PIXI.Text(room.visitedNeighbors, textStyleOptions);
      text.x = room.x * gridSize + gridSize / 2;
      text.y = room.y * gridSize + gridSize / 2;
      texts.addChild(text);
      textRefs.push(text);
    }
  }

  return (revealed) => {
    front.clear();

    for (let i = 0; i < level.rooms.length; i++) {
      const room = level.rooms[i];
      const left = room.x * gridSize;
      const top = room.y * gridSize;
      const right = left + gridSize;
      const bottom = top + gridSize;

      if (debug === DEBUG_MODE.visited) {
        textRefs[i].text = room.visitedNeighbors;
      }

      if (room.visited) {
        drawVisited(back, left, top, gridSize);
      }

      if (!revealed && debug !== DEBUG_MODE.layout) {
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
