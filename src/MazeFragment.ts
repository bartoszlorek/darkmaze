import { DirectionIndex, DirectionAngle, differenceAngle } from "./math";

export enum WallState {
  open = 0,
  closed = 1,
}

export class MazeFragment {
  public x: number;
  public y: number;
  public walls: [WallState, WallState, WallState, WallState];

  constructor(
    x: number,
    y: number,
    walls: [WallState, WallState, WallState, WallState]
  ) {
    this.x = x;
    this.y = y;
    this.walls = walls;
  }

  contains(x: number, y: number) {
    return !(this.x !== Math.round(x) || this.y !== Math.round(y));
  }

  closestOpenWallAngle(normalizedAngle: number) {
    let angle: undefined | number;

    if (this.walls[DirectionIndex.up] === WallState.open) {
      const diff = differenceAngle(DirectionAngle.up, normalizedAngle);
      if (angle === undefined || Math.abs(diff) < Math.abs(angle)) {
        angle = diff;
      }
    }

    if (this.walls[DirectionIndex.right] === WallState.open) {
      const diff = differenceAngle(DirectionAngle.right, normalizedAngle);
      if (angle === undefined || Math.abs(diff) < Math.abs(angle)) {
        angle = diff;
      }
    }

    if (this.walls[DirectionIndex.down] === WallState.open) {
      const diff = differenceAngle(DirectionAngle.down, normalizedAngle);
      if (angle === undefined || Math.abs(diff) < Math.abs(angle)) {
        angle = diff;
      }
    }

    if (this.walls[DirectionIndex.left] === WallState.open) {
      const diff = differenceAngle(DirectionAngle.left, normalizedAngle);
      if (angle === undefined || Math.abs(diff) < Math.abs(angle)) {
        angle = diff;
      }
    }

    return angle;
  }
}
