import { normalizeAngle } from "./math";
import type { Maybe } from "./types";

export type Direction4Key = keyof typeof Direction4Angle;
export enum Direction4Angle {
  up = 0,
  right = 90,
  down = 180,
  left = 270,
}

export type Direction8Key = keyof typeof Direction8Angle;
export enum Direction8Angle {
  up = 0,
  upRight = 45,
  right = 90,
  downRight = 135,
  down = 180,
  downLeft = 225,
  left = 270,
  upLeft = 315,
}

export interface Direction4Neighbors<T> {
  up: Maybe<T>;
  left: Maybe<T>;
  right: Maybe<T>;
  down: Maybe<T>;
}

export interface Direction8Neighbors<T> {
  upLeft: Maybe<T>;
  up: Maybe<T>;
  upRight: Maybe<T>;
  left: Maybe<T>;
  right: Maybe<T>;
  downLeft: Maybe<T>;
  down: Maybe<T>;
  downRight: Maybe<T>;
}

export function createEmptyNeighbors4<T = null>(): Direction4Neighbors<T> {
  return {
    up: null,
    left: null,
    right: null,
    down: null,
  };
}

export function createEmptyNeighbors8<T = null>(): Direction8Neighbors<T> {
  return {
    upLeft: null,
    up: null,
    upRight: null,
    left: null,
    right: null,
    downLeft: null,
    down: null,
    downRight: null,
  };
}

export function direction4KeyFromAngle(angle: number): Direction4Key {
  const shift = normalizeAngle(angle + 45);
  if (shift < Direction4Angle.right) return "up";
  if (shift < Direction4Angle.down) return "right";
  if (shift < Direction4Angle.left) return "down";
  return "left";
}

export function direction8KeyFromAngle(angle: number): Direction8Key {
  const shift = normalizeAngle(angle + 22.5);
  if (shift < Direction8Angle.upRight) return "up";
  if (shift < Direction8Angle.right) return "upRight";
  if (shift < Direction8Angle.downRight) return "right";
  if (shift < Direction8Angle.down) return "downRight";
  if (shift < Direction8Angle.downLeft) return "down";
  if (shift < Direction8Angle.left) return "downLeft";
  if (shift < Direction8Angle.upLeft) return "left";
  return "upLeft";
}
