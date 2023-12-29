import { DirectionIndex, FacingAngle } from "../helpers";

export enum WallState {
  open = 0,
  closed = 1,
}

export type RoomType = "start" | "empty" | "evil" | "golden" | "passage";

// wall state permutations
// for (let i = 0; i <= ~(-1 << 4); i++) {
//   console.log(i.toString(2).padStart(4, "0"));
// }
export type RoomSignature =
  | "0000"
  | "0001"
  | "0010"
  | "0011"
  | "0100"
  | "0101"
  | "0110"
  | "0111"
  | "1000"
  | "1001"
  | "1010"
  | "1011"
  | "1100"
  | "1101"
  | "1110"
  | "1111";

export const isEvil = (room: Room) => room.type === "evil";

export class Room {
  public x: number;
  public y: number;
  public walls: [WallState, WallState, WallState, WallState];
  public signature: RoomSignature = "0000";
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
  public visitedDirection: DirectionIndex | null = null;
  public explored: boolean = false;

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
    let signature = "";

    for (const wall of this.walls) {
      if (wall === WallState.open) {
        entrances += 1;
        signature += "0";
      } else {
        signature += "1";
      }
    }
    this.deadEnd = entrances === 1;
    this.signature = signature as RoomSignature;
  }

  public setVisited(previousRoom: Room | null) {
    this.visited = true;

    if (previousRoom) {
      switch (true) {
        case previousRoom.x < this.x:
          this.visitedDirection = DirectionIndex.right;
          break;

        case previousRoom.x > this.x:
          this.visitedDirection = DirectionIndex.left;
          break;

        case previousRoom.y < this.y:
          this.visitedDirection = DirectionIndex.down;
          break;

        case previousRoom.y > this.y:
          this.visitedDirection = DirectionIndex.up;
          break;
      }
    } else {
      this.visitedDirection = null;
    }

    if (this.deadEnd && this.type !== "start") {
      this.explored = true;
    }
  }

  public incrementVisitedConnectedRooms() {
    this.visitedConnectedRooms += 1;

    const threshold = this.type === "start" ? 1 : 2;
    if (this.visitedConnectedRooms >= threshold) {
      this.explored = true;
    }
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
