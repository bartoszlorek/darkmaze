import { EventEmitter } from "./EventEmitter";
import { Player } from "./Player";
import { Room } from "./Room";
import { GridMap } from "../helpers";

export type LevelEvents = {
  room_enter: { room: Room };
  room_leave: { room: Room };
  room_visit: { room: Room };
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

    /**
     * The queue synchronizes the emitting of events
     * when the currently visited room and its connected
     * neighbors have finished processing.
     */
    const exploreEventQueue = [];
    let shouldEmitVisitEvent = false;

    const currentRoom = this.getCurrentRoom(player);
    if (!currentRoom.visited) {
      currentRoom.visited = true;
      shouldEmitVisitEvent = true;

      /**
       * The dead end rooms (except the starting one)
       * should be explored immediately after the visit.
       */
      if (currentRoom.deadEnd && currentRoom.type !== "start") {
        currentRoom.explored = true;
        exploreEventQueue.push(currentRoom);
      }

      for (const otherRoom of this.getConnectedRooms(currentRoom)) {
        otherRoom.visitedConnectedRooms += 1;
        if (otherRoom.explored) {
          continue;
        }

        const thresholdToBecomeExplored = otherRoom.type === "start" ? 1 : 2;
        if (thresholdToBecomeExplored <= otherRoom.visitedConnectedRooms) {
          otherRoom.explored = true;
          exploreEventQueue.push(otherRoom);
        }
      }
    }

    this.emit("room_enter", {
      room: currentRoom,
    });

    if (shouldEmitVisitEvent) {
      this.emit("room_visit", {
        room: currentRoom,
      });
    }

    for (const room of exploreEventQueue) {
      this.emit("room_explore", {
        room,
      });
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
