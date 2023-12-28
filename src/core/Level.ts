import { EventEmitter } from "./EventEmitter";
import { DirectionIndex } from "../helpers";
import { Player } from "./Player";
import { Room, WallState } from "./Room";

type Maybe<T> = T | null;

export type RoomPredicate = (room: Room) => boolean;

export type ConnectedRooms = [
  up: Maybe<Room>,
  right: Maybe<Room>,
  down: Maybe<Room>,
  left: Maybe<Room>
];

export type LevelEvents = {
  room_enter: { room: Room };
  room_leave: { room: Room };
};

export class Level extends EventEmitter<LevelEvents> {
  public rooms: Room[];
  public dimension: number;

  protected roomsIndexedMap: Map<string, Room>;
  protected lastVisitedRoom: Room | null = null;

  // pre-allocated memory
  private _connectedRooms: ConnectedRooms = [null, null, null, null];

  constructor(rooms: Room[]) {
    super();
    this.rooms = rooms;
    this.dimension = Math.sqrt(rooms.length);

    // index rooms
    this.roomsIndexedMap = new Map<string, Room>();
    for (let i = 0; i < rooms.length; i++) {
      const key = this.getRoomKey(rooms[i].x, rooms[i].y);
      this.roomsIndexedMap.set(key, rooms[i]);
    }
  }

  protected getRoomKey(roomX: number, roomY: number) {
    return `${roomX}-${roomY}`;
  }

  protected getRoom(x: number, y: number) {
    return this.roomsIndexedMap.get(this.getRoomKey(x, y));
  }

  public getCurrentRoom(player: Player) {
    const x = Math.round(player.x);
    const y = Math.round(player.y);

    const match = this.getRoom(x, y);
    if (match === undefined) {
      throw new Error("the player is outside the level");
    }

    return match;
  }

  public updateCurrentRoom(player: Player) {
    if (this.lastVisitedRoom?.contains(player.x, player.y)) {
      return this.lastVisitedRoom;
    }

    const currentRoom = this.getCurrentRoom(player);
    if (!currentRoom.visited) {
      currentRoom.visited = true;

      for (const room of this.getConnectedRooms(currentRoom)) {
        if (room) room.visitedNeighbors += 1;
      }
    }

    this.emit("room_enter", {
      room: currentRoom,
    });

    // for the first time
    if (this.lastVisitedRoom === null) {
      this.lastVisitedRoom = currentRoom;
      return currentRoom;
    }

    this.emit("room_leave", {
      room: this.lastVisitedRoom,
    });

    this.lastVisitedRoom = currentRoom;
    return currentRoom;
  }

  public getConnectedRooms(room: Room) {
    const x = room.x;
    const y = room.y;

    this._connectedRooms[0] =
      room.walls[DirectionIndex.up] === WallState.open
        ? this.getRoom(x, y - 1) || null
        : null;

    this._connectedRooms[1] =
      room.walls[DirectionIndex.right] === WallState.open
        ? this.getRoom(x + 1, y) || null
        : null;

    this._connectedRooms[2] =
      room.walls[DirectionIndex.down] === WallState.open
        ? this.getRoom(x, y + 1) || null
        : null;

    this._connectedRooms[3] =
      room.walls[DirectionIndex.left] === WallState.open
        ? this.getRoom(x - 1, y) || null
        : null;

    return this._connectedRooms;
  }

  public filterConnectedRooms(room: Room, predicate: RoomPredicate) {
    return this.getConnectedRooms(room).filter((room) =>
      room !== null ? predicate(room) : false
    ) as Room[];
  }

  public someConnectedRooms(room: Room, predicate: RoomPredicate) {
    return this.getConnectedRooms(room).some((room) =>
      room !== null ? predicate(room) : false
    );
  }
}
