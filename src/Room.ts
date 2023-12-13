export enum WallState {
  open = 0,
  closed = 1,
}

export type RoomType = "empty" | "evil" | "golden" | "passage";

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

    const openWallsCount = walls.reduce((sum, state) => {
      return sum + (state === WallState.open ? 1 : 0);
    }, 0);

    this.deadEnd = openWallsCount === 1;
  }

  public contains(x: number, y: number): boolean {
    return !(this.x !== Math.round(x) || this.y !== Math.round(y));
  }
}
