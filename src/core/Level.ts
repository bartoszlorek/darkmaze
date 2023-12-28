import { EventEmitter } from "./EventEmitter";
import { DirectionIndex } from "../helpers";
import { Player } from "./Player";
import { Room, WallState } from "./Room";

type Maybe<T> = T | null;

export type RoomPredicate = (room: Room) => boolean;

export type AdjacentRooms = [
  up: Maybe<Room>,
  upRight: Maybe<Room>,
  right: Maybe<Room>,
  downRight: Maybe<Room>,
  down: Maybe<Room>,
  downLeft: Maybe<Room>,
  left: Maybe<Room>,
  upLeft: Maybe<Room>
];

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
  // prettier-ignore
  private _adjacentRooms: AdjacentRooms = [
    null, null, null, null,
    null, null, null, null,
  ];

  // pre-allocated memory
  // prettier-ignore
  private _connectedRooms: ConnectedRooms = [
    null, null, null, null
  ];

  constructor(rooms: Room[]) {
    super();
    this.rooms = rooms;
    this.dimension = Math.sqrt(rooms.length);

    // index rooms
    this.roomsIndexedMap = new Map<string, Room>();
    for (const room of rooms) {
      const roomKey = this.getRoomKey(room.x, room.y);
      this.roomsIndexedMap.set(roomKey, room);
    }

    // count adjacent rooms
    for (const room of rooms) {
      let count = 0;
      for (const adjacent of this.getAdjacentRooms(room)) {
        if (adjacent) count += 1;
      }
      room.adjacentRoomsCount = count;
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

      for (const room of this.getAdjacentRooms(currentRoom)) {
        if (room) room.visitedAdjacentRooms += 1;
      }
      for (const room of this.getConnectedRooms(currentRoom)) {
        if (room) room.visitedConnectedRooms += 1;
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

  public getAdjacentRooms(room: Room) {
    const x = room.x;
    const y = room.y;
    const left = x - 1;
    const right = x + 1;
    const up = y - 1;
    const down = y + 1;

    this._adjacentRooms[0] = this.getRoom(x, up) || null;
    this._adjacentRooms[1] = this.getRoom(right, up) || null;
    this._adjacentRooms[2] = this.getRoom(right, y) || null;
    this._adjacentRooms[3] = this.getRoom(right, down) || null;
    this._adjacentRooms[4] = this.getRoom(x, down) || null;
    this._adjacentRooms[5] = this.getRoom(left, down) || null;
    this._adjacentRooms[6] = this.getRoom(left, y) || null;
    this._adjacentRooms[7] = this.getRoom(left, up) || null;

    return this._adjacentRooms;
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
