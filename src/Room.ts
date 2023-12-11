import { DirectionIndex, DirectionAngle, subtractAngle } from "./utils";

export enum WallState {
  open = 0,
  closed = 1,
}

export type RoomType = "empty" | "gold" | "evil" | "portal";

export class Room {
  public x: number;
  public y: number;
  public walls: [WallState, WallState, WallState, WallState];
  public type: RoomType;

  /**
   * the room exploration is moving from
   * one unexplored room to another
   */
  public explored: boolean = false;

  /**
   * the room has only one open wall,
   * which is the entrance
   */
  public deadEnd: boolean = false;

  constructor(
    x: number,
    y: number,
    walls: [WallState, WallState, WallState, WallState],
    type: RoomType = "empty"
  ) {
    this.x = x;
    this.y = y;
    this.walls = walls;
    this.type = type;

    const openWallsCount = walls.reduce((sum, state) => {
      return sum + (state === WallState.open ? 1 : 0);
    }, 0);

    this.deadEnd = openWallsCount === 1;
  }

  public contains(x: number, y: number): boolean {
    return !(this.x !== Math.round(x) || this.y !== Math.round(y));
  }

  public closestOpenWallDiffAngle(normalizedAngle: number): number | undefined {
    let angle: undefined | number;

    if (this.walls[DirectionIndex.up] === WallState.open) {
      const diff = subtractAngle(DirectionAngle.up, normalizedAngle);
      if (angle === undefined || Math.abs(diff) < Math.abs(angle)) {
        angle = diff;
      }
    }

    if (this.walls[DirectionIndex.right] === WallState.open) {
      const diff = subtractAngle(DirectionAngle.right, normalizedAngle);
      if (angle === undefined || Math.abs(diff) < Math.abs(angle)) {
        angle = diff;
      }
    }

    if (this.walls[DirectionIndex.down] === WallState.open) {
      const diff = subtractAngle(DirectionAngle.down, normalizedAngle);
      if (angle === undefined || Math.abs(diff) < Math.abs(angle)) {
        angle = diff;
      }
    }

    if (this.walls[DirectionIndex.left] === WallState.open) {
      const diff = subtractAngle(DirectionAngle.left, normalizedAngle);
      if (angle === undefined || Math.abs(diff) < Math.abs(angle)) {
        angle = diff;
      }
    }

    return angle;
  }
}
