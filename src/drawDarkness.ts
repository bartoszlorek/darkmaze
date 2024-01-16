import * as PIXI from "pixi.js";
import { DrawFunction, Direction4Angle, getPointInView, lerp } from "./helpers";
import type { Player, Level, Room } from "./core";
import type { Maybe } from "./helpers";

const FIELD_OF_VIEW = 180;
const MIN_LINES_COUNT = 15;
const FADE_OUT_SPEED = 0.05;

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

  let fadeOut = false;
  level.subscribe("reveal", () => {
    fadeOut = true;
  });

  const openWallsInView: Maybe<number>[] = [null, null, null, null];
  const lines: number[] = [];
  const linesBuffer: number[] = [];

  return () => {
    if (fadeOut) {
      g.alpha = Math.max(0, g.alpha - FADE_OUT_SPEED);
      return;
    }

    if (!currentRoom) {
      return;
    }

    // update room angles according to player's view
    openWallsInView[0] = !currentRoom.walls.up
      ? getPointInView(player.angle, Direction4Angle.up, FIELD_OF_VIEW)
      : null;

    openWallsInView[1] = !currentRoom.walls.right
      ? getPointInView(player.angle, Direction4Angle.right, FIELD_OF_VIEW)
      : null;

    openWallsInView[2] = !currentRoom.walls.down
      ? getPointInView(player.angle, Direction4Angle.down, FIELD_OF_VIEW)
      : null;

    openWallsInView[3] = !currentRoom.walls.left
      ? getPointInView(player.angle, Direction4Angle.left, FIELD_OF_VIEW)
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

    interpolatePoints(linesBuffer, linesCount, openWallsInView);

    g.clear();
    for (let i = 0; i < linesCount; i++) {
      const a = lines[i] || 0;
      const b = linesBuffer[i];

      lines[i] = lerp(a, b, a < b ? 0.25 : 0.025);
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
