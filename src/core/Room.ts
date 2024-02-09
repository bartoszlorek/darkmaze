import {
  Bit,
  Direction4Neighbors,
  Direction4Key,
  direction4KeyFromAngle,
  direction8KeyFromAngle,
} from "../helpers";

export type RoomType = "start" | "empty" | "evil" | "golden" | "passage";

export type RoomWalls = Readonly<Direction4Neighbors<boolean>>;

export class Room {
  public x: number;
  public y: number;
  public type: RoomType;
  public walls: RoomWalls = {
    up: false,
    left: false,
    right: false,
    down: false,
  };

  /**
   * the room has only one exit
   */
  public deadEnd: boolean = false;

  /**
   * exploration mechanics
   */
  public visited: boolean = false;
  public visitedConnectedRooms: number = 0;
  public explored: boolean = false;

  constructor(x: number, y: number, type: RoomType = "empty") {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  public setWalls(walls: Partial<RoomWalls>) {
    this.walls = Object.assign(this.walls, walls);

    let exits = 0;
    if (!this.walls.up) exits += 1;
    if (!this.walls.left) exits += 1;
    if (!this.walls.right) exits += 1;
    if (!this.walls.down) exits += 1;

    this.deadEnd = exits <= 1;
    return this;
  }

  public setWallsByBit(up: Bit, left: Bit, right: Bit, down: Bit) {
    return this.setWalls({
      up: Boolean(up),
      left: Boolean(left),
      right: Boolean(right),
      down: Boolean(down),
    });
  }

  public contains(x: number, y: number): boolean {
    return !(this.x !== Math.round(x) || this.y !== Math.round(y));
  }

  public direction(currAngle: number, prevAngle: number): Direction4Key {
    const directionKey = direction8KeyFromAngle(currAngle);

    switch (directionKey) {
      case "upLeft":
        if (direction4KeyFromAngle(prevAngle) === "up") {
          return this.walls.left ? "up" : "left";
        } else {
          return this.walls.up ? "left" : "up";
        }

      case "upRight":
        if (direction4KeyFromAngle(prevAngle) === "up") {
          return this.walls.right ? "up" : "right";
        } else {
          return this.walls.up ? "right" : "up";
        }

      case "downLeft":
        if (direction4KeyFromAngle(prevAngle) === "down") {
          return this.walls.left ? "down" : "left";
        } else {
          return this.walls.down ? "left" : "down";
        }

      case "downRight":
        if (direction4KeyFromAngle(prevAngle) === "down") {
          return this.walls.right ? "down" : "right";
        } else {
          return this.walls.down ? "right" : "down";
        }

      default:
        return directionKey;
    }
  }

  static isEvil(room: Room) {
    return room.type === "evil";
  }

  static isGolden(room: Room) {
    return room.type === "golden";
  }
}
