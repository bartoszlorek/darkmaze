import * as PIXI from "pixi.js";
import {
  DrawFunction,
  DirectionAngle,
  DirectionIndex,
  getPointInView,
  lerp,
} from "./helpers";
import { WallState } from "./core";
import type { Player, Level, Room } from "./core";
import type { Maybe } from "./helpers";

const FIELD_OF_VIEW = 180;
const MIN_LINES_COUNT = 15;

export const drawDarkness: DrawFunction<{
  player: Player;
  level: Level;
  gridSize: number;
}> = ({ parent, player, level, gridSize }) => {
  const g = new PIXI.Graphics();
  parent.addChild(g);

  let currentRoom: Room | null = null;
  level.subscribe("room_enter", ({ room }) => {
    currentRoom = room;
  });

  const currentOpenWallsInView: [
    Maybe<number>,
    Maybe<number>,
    Maybe<number>,
    Maybe<number>
  ] = [null, null, null, null];

  const lines: number[] = [];
  const linesBuffer: number[] = [];

  return () => {
    if (!currentRoom) {
      return;
    }

    // update room angles according to player's view
    currentOpenWallsInView[DirectionIndex.up] =
      currentRoom.walls[DirectionIndex.up] === WallState.open
        ? getPointInView(player.angle, DirectionAngle.up, FIELD_OF_VIEW)
        : null;

    currentOpenWallsInView[DirectionIndex.right] =
      currentRoom.walls[DirectionIndex.right] === WallState.open
        ? getPointInView(player.angle, DirectionAngle.right, FIELD_OF_VIEW)
        : null;

    currentOpenWallsInView[DirectionIndex.down] =
      currentRoom.walls[DirectionIndex.down] === WallState.open
        ? getPointInView(player.angle, DirectionAngle.down, FIELD_OF_VIEW)
        : null;

    currentOpenWallsInView[DirectionIndex.left] =
      currentRoom.walls[DirectionIndex.left] === WallState.open
        ? getPointInView(player.angle, DirectionAngle.left, FIELD_OF_VIEW)
        : null;

    // the number of lines should be odd
    // to perfectly center the middle one
    let linesCount = Math.ceil(window.innerWidth / gridSize);
    if (linesCount % 2 === 0) {
      linesCount += 1;
    }

    let linesWidth = gridSize;
    if (linesCount < MIN_LINES_COUNT) {
      linesCount = MIN_LINES_COUNT * 2 - 1;
      linesWidth = gridSize / 2;
    }

    const linesOffset = (linesCount * linesWidth - window.innerWidth) / 2;
    const linesHeight = window.innerHeight;

    // clear the buffer
    for (let i = 0; i < linesCount; i++) {
      linesBuffer[i] = 0;
    }

    interpolatePoints(linesBuffer, linesCount, currentOpenWallsInView);

    g.clear();
    for (let i = 0; i < linesCount; i++) {
      lines[i] = lerp(lines[i] ?? 0, linesBuffer[i], 0.15);
      g.beginFill(0x17152e, 1 - lines[i]);
      g.drawRect(i * linesWidth - linesOffset, 0, linesWidth, linesHeight);
    }
  };
};

function interpolatePoints(
  lines: number[],
  length: number,
  points: Maybe<number>[]
) {
  const blurLength = Math.floor(length / 3);

  for (const point of points) {
    if (point === null) {
      continue;
    }

    const index = Math.floor(point * length);
    if (index >= 0 && index < length) {
      lines[index] += 1;
    }

    for (let j = 1; j <= blurLength; j++) {
      const prev = index - j;
      if (prev >= 0 && prev < length) {
        lines[prev] += 1 - j / blurLength;
      }

      const next = index + j;
      if (next >= 0 && next < length) {
        lines[next] += 1 - j / blurLength;
      }
    }
  }

  return lines;
}
