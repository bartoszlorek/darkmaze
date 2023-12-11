import { Room } from "./Room";
import { Player } from "./Player";
import { EventEmitter } from "./EventEmitter";

type Maybe<T> = T | null;

// prettier-ignore
export type AdjacentRooms = [
  Maybe<Room>, Maybe<Room>, Maybe<Room>,
  Maybe<Room>, Maybe<Room>, Maybe<Room>,
  Maybe<Room>, Maybe<Room>, Maybe<Room>
];

export type LevelEvents = {
  room_enter: { room: Room };
  room_leave: { room: Room };
  room_explore: { room: Room };
};

export class Level extends EventEmitter<LevelEvents> {
  public rooms: Room[];
  public dimension: number;

  protected roomsIndexedMap: Map<string, Room>;
  protected lastVisitedRoom: Room | null = null;

  // pre-allocated memory
  // prettier-ignore
  private _adjacentRooms: AdjacentRooms = [
    null, null, null,
    null, null, null,
    null, null, null
  ];

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
    this.emit("room_enter", {
      room: currentRoom,
    });

    // the first time
    if (this.lastVisitedRoom === null) {
      this.lastVisitedRoom = currentRoom;
      return currentRoom;
    }

    this.emit("room_leave", {
      room: this.lastVisitedRoom,
    });

    if (!currentRoom.explored) {
      // an unexplored room with one entrance
      // (dead end) can be explored immediately
      if (currentRoom.deadEnd) {
        currentRoom.explored = true;
        this.emit("room_explore", {
          room: currentRoom,
        });
      }

      // a room with many entrances can be explored
      // by moving to another unexplored room
      if (!this.lastVisitedRoom.explored) {
        this.lastVisitedRoom.explored = true;
        this.emit("room_explore", {
          room: this.lastVisitedRoom,
        });
      }
    }

    this.lastVisitedRoom = currentRoom;
    return currentRoom;
  }

  public getAdjacentRooms(room: Room) {
    const x = room.x;
    const y = room.y;

    // the previous row
    this._adjacentRooms[0] = this.getRoom(x - 1, y - 1) || null;
    this._adjacentRooms[1] = this.getRoom(x, y - 1) || null;
    this._adjacentRooms[2] = this.getRoom(x + 1, y - 1) || null;

    // the current row
    this._adjacentRooms[3] = this.getRoom(x - 1, y) || null;
    this._adjacentRooms[4] = room;
    this._adjacentRooms[5] = this.getRoom(x + 1, y) || null;

    // the next row
    this._adjacentRooms[6] = this.getRoom(x - 1, y + 1) || null;
    this._adjacentRooms[7] = this.getRoom(x, y + 1) || null;
    this._adjacentRooms[8] = this.getRoom(x + 1, y + 1) || null;

    return this._adjacentRooms;
  }
}
