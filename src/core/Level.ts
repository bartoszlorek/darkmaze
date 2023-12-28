import { EventEmitter } from "./EventEmitter";
import { Player } from "./Player";
import { Room, WallState } from "./Room";

type Maybe<T> = T | null;

export type RoomPredicate = (room: Room) => boolean;

export type RoomCluster = [
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
  private _connectedRooms: RoomCluster = [null, null, null, null];
  private _neighborRooms: RoomCluster = [null, null, null, null];

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
        if (room) room.visitedConnectedRooms += 1;
      }

      const neighbors = this.getNeighborRooms(currentRoom);
      if (neighbors[0]) neighbors[0].visitedVerticalNeighborRooms += 1;
      if (neighbors[1]) neighbors[1].visitedHorizontalNeighborRooms += 1;
      if (neighbors[2]) neighbors[2].visitedVerticalNeighborRooms += 1;
      if (neighbors[3]) neighbors[3].visitedHorizontalNeighborRooms += 1;
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

  public getNeighborRooms(room: Room) {
    const x = room.x;
    const y = room.y;

    this._neighborRooms[0] = this.getRoom(x, y - 1) || null;
    this._neighborRooms[1] = this.getRoom(x + 1, y) || null;
    this._neighborRooms[2] = this.getRoom(x, y + 1) || null;
    this._neighborRooms[3] = this.getRoom(x - 1, y) || null;

    return this._neighborRooms;
  }

  public getConnectedRooms(room: Room) {
    const x = room.x;
    const y = room.y;

    this._connectedRooms[0] =
      (room.walls[0] === WallState.open && this.getRoom(x, y - 1)) || null;

    this._connectedRooms[1] =
      (room.walls[1] === WallState.open && this.getRoom(x + 1, y)) || null;

    this._connectedRooms[2] =
      (room.walls[2] === WallState.open && this.getRoom(x, y + 1)) || null;

    this._connectedRooms[3] =
      (room.walls[3] === WallState.open && this.getRoom(x - 1, y)) || null;

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
