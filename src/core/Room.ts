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
   * the room has only one open wall,
   * which is the entrance
   */
  public deadEnd: boolean = false;

  /**
   * exploration mechanics
   */
  public visited: boolean = false;
  public visitedConnectedRooms: number = 0;
  public explored: boolean = false;
  public exploredConnectedRooms: number = 0;

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
    this.parse();
  }

  public parse() {
    let entrances = 0;
    for (const wall of this.walls) {
      if (wall === WallState.open) {
        entrances += 1;
      }
    }
    this.deadEnd = entrances === 1;
  }

  public contains(x: number, y: number): boolean {
    return !(this.x !== Math.round(x) || this.y !== Math.round(y));
  }

  public directionIndexFromAngle(
    currentFacingAngle: number,
    previousFacingAngle: number
  ): DirectionIndex {
    switch (currentFacingAngle) {
      case FacingAngle.up:
        return DirectionIndex.up;

      case FacingAngle.down:
        return DirectionIndex.down;

      case FacingAngle.right:
        return DirectionIndex.right;

      case FacingAngle.left:
        return DirectionIndex.left;

      case FacingAngle.upRight:
        // the change from the up to upRight indicates intent to turn right
        if (previousFacingAngle === DirectionIndex.up) {
          return this.walls[DirectionIndex.right] === WallState.open
            ? DirectionIndex.right
            : DirectionIndex.up;
        } else {
          return this.walls[DirectionIndex.up] === WallState.open
            ? DirectionIndex.up
            : DirectionIndex.right;
        }

      case FacingAngle.downRight:
        // the change from the down to downRight indicates intent to turn right
        if (previousFacingAngle === DirectionIndex.down) {
          return this.walls[DirectionIndex.right] === WallState.open
            ? DirectionIndex.right
            : DirectionIndex.down;
        } else {
          return this.walls[DirectionIndex.down] === WallState.open
            ? DirectionIndex.down
            : DirectionIndex.right;
        }

      case FacingAngle.upLeft:
        // the change from the up to upLeft indicates intent to turn left
        if (previousFacingAngle === DirectionIndex.up) {
          return this.walls[DirectionIndex.left] === WallState.open
            ? DirectionIndex.left
            : DirectionIndex.up;
        } else {
          return this.walls[DirectionIndex.up] === WallState.open
            ? DirectionIndex.up
            : DirectionIndex.left;
        }

      case FacingAngle.downLeft:
        // the change from the down to downLeft indicates intent to turn left
        if (previousFacingAngle === DirectionIndex.down) {
          return this.walls[DirectionIndex.left] === WallState.open
            ? DirectionIndex.left
            : DirectionIndex.down;
        } else {
          return this.walls[DirectionIndex.down] === WallState.open
            ? DirectionIndex.down
            : DirectionIndex.left;
        }

      default:
        return DirectionIndex.up;
    }
  }
}
