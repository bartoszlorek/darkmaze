import { EventEmitter } from "./EventEmitter";
import { Player } from "./Player";
import { Room } from "./Room";
import { GridMap } from "../helpers";

export type LevelEvents = {
  room_enter: { room: Room };
  room_leave: { room: Room };
  room_explore: { room: Room };
  reveal: undefined;
};

export class Level extends EventEmitter<LevelEvents> {
  public dimension: number;
  public rooms: GridMap<Room>;
  public lastVisitedRoom: Room | null = null;

  constructor(rooms: Room[]) {
    super();
    this.dimension = Math.sqrt(rooms.length);
    this.rooms = new GridMap<Room>(this.dimension, this.dimension);

    for (const room of rooms) {
      this.rooms.setValue(room.x, room.y, room);
    }
  }

  public getCurrentRoom(player: Player) {
    const x = Math.round(player.x);
    const y = Math.round(player.y);

    const match = this.rooms.getValue(x, y);
    if (match === undefined) {
      throw new Error("the player is outside the level");
    }

    return match.value;
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
      const exploreEventQueue = [];

      if (currentRoom.deadEnd && currentRoom.type !== "start") {
        currentRoom.explored = true;
        exploreEventQueue.push(currentRoom);
      }

      for (const otherRoom of this.getConnectedRooms(currentRoom)) {
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
          exploreEventQueue.push(otherRoom);

          for (const anotherRoom of this.getConnectedRooms(otherRoom)) {
            anotherRoom.exploredConnectedRooms += 1;
          }
        }
      }

      for (const room of exploreEventQueue) {
        this.emit("room_explore", { room });
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
    const matches: Room[] = [];

    if (!room.walls.up) {
      matches.push(this.rooms.getValue(room.x, room.y - 1)?.value as Room);
    }
    if (!room.walls.left) {
      matches.push(this.rooms.getValue(room.x - 1, room.y)?.value as Room);
    }
    if (!room.walls.right) {
      matches.push(this.rooms.getValue(room.x + 1, room.y)?.value as Room);
    }
    if (!room.walls.down) {
      matches.push(this.rooms.getValue(room.x, room.y + 1)?.value as Room);
    }

    return matches;
  }
}
