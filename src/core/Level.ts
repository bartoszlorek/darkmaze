import { EventEmitter } from "./EventEmitter";
import { Player } from "./Player";
import { Room, WallState } from "./Room";
import type { Maybe } from "../helpers";

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
  room_explore: { room: Room };
};

export class Level extends EventEmitter<LevelEvents> {
  public rooms: Room[];
  public dimension: number;

  protected roomsIndexedMap: Map<string, Room>;
  protected lastVisitedRoom: Room | null = null;

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
    this.emit("room_enter", {
      room: currentRoom,
    });

    if (!currentRoom.visited) {
      currentRoom.visited = true;

      if (currentRoom.deadEnd && currentRoom.type !== "start") {
        currentRoom.explored = true;
        this.emit("room_explore", {
          room: currentRoom,
        });
      }

      for (const otherRoom of this.getConnectedRooms(currentRoom)) {
        if (!otherRoom) {
          continue;
        }
        otherRoom.visitedConnectedRooms += 1;

        // the current room should have just been explored
        if (currentRoom.explored) {
          otherRoom.exploredConnectedRooms += 1;
        }

        const threshold = otherRoom.type === "start" ? 1 : 2;

        if (
          otherRoom.explored === false &&
          otherRoom.visitedConnectedRooms >= threshold
        ) {
          otherRoom.explored = true;
          this.emit("room_explore", {
            room: otherRoom,
          });

          for (const anotherRoom of this.getConnectedRooms(otherRoom)) {
            if (anotherRoom) {
              anotherRoom.exploredConnectedRooms += 1;
            }
          }
        }
      }
    }

    if (this.lastVisitedRoom !== null) {
      this.emit("room_leave", {
        room: this.lastVisitedRoom,
      });
    }

    this.lastVisitedRoom = currentRoom;
    return currentRoom;
  }

  public getConnectedRooms(room: Room) {
    const matches: ConnectedRooms = [null, null, null, null];

    if (room.walls[0] === WallState.open) {
      matches[0] = this.getRoom(room.x, room.y - 1) || null;
    }
    if (room.walls[1] === WallState.open) {
      matches[1] = this.getRoom(room.x + 1, room.y) || null;
    }
    if (room.walls[2] === WallState.open) {
      matches[2] = this.getRoom(room.x, room.y + 1) || null;
    }
    if (room.walls[3] === WallState.open) {
      matches[3] = this.getRoom(room.x - 1, room.y) || null;
    }

    return matches;
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
