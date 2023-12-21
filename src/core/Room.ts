import { DirectionIndex, FacingAngle } from "../helpers";

export enum WallState {
  open = 0,
  closed = 1,
}

export type RoomType = "start" | "empty" | "evil" | "golden" | "passage";

export const isEvil = (room: Room) => room.type === "evil";

export class Room {
  public x: number;
  public y: number;
  public walls: [WallState, WallState, WallState, WallState];
  public type: RoomType;

  /**
   * the rooms exploration reveals the shape
   * of the level as player moves between rooms
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
    this.evaluate();
  }

  public evaluate() {
    const openWallsCount = this.walls.reduce((sum, state) => {
      return sum + (state === WallState.open ? 1 : 0);
    }, 0);

    this.deadEnd = openWallsCount === 1;
  }

  public contains(x: number, y: number): boolean {
    return !(this.x !== Math.round(x) || this.y !== Math.round(y));
  }

  public directionIndexFromAngle(facingAngle: number): DirectionIndex {
    switch (facingAngle) {
      case FacingAngle.up:
        return DirectionIndex.up;

      case FacingAngle.down:
        return DirectionIndex.down;

      case FacingAngle.right:
        return DirectionIndex.right;

      case FacingAngle.left:
        return DirectionIndex.left;

      case FacingAngle.upRight:
        return this.walls[DirectionIndex.up] === WallState.open
          ? DirectionIndex.up
          : DirectionIndex.right;

      case FacingAngle.downRight:
        return this.walls[DirectionIndex.down] === WallState.open
          ? DirectionIndex.down
          : DirectionIndex.right;

      case FacingAngle.upLeft:
        return this.walls[DirectionIndex.up] === WallState.open
          ? DirectionIndex.up
          : DirectionIndex.left;

      case FacingAngle.downLeft:
        return this.walls[DirectionIndex.down] === WallState.open
          ? DirectionIndex.down
          : DirectionIndex.left;

      default:
        return DirectionIndex.up;
    }
  }
}
