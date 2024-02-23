import { EventEmitter } from "./EventEmitter";
import { Player } from "./Player";
import { Room } from "./Room";
import { GridMap, findPathUntil, angleBetweenPoints } from "../helpers";

export type LevelEvents = {
  room_enter: { room: Room };
  room_leave: { room: Room };
  room_visit: { room: Room };
  room_explore: { room: Room };
};

export class Level extends EventEmitter<LevelEvents> {
  public dimension: number;
  public rooms: GridMap<Room>;
  public lastVisitedRoom: Room | null = null;
  public difficulty: number = 0;

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

  updateCorrectPaths() {
    let startRoom: Room | null = null;
    let goalRoom: Room | null = null;
    const deadEndRooms: Room[] = [];

    for (const [key, room] of this.rooms) {
      if (room.value.type === "start") {
        startRoom = room.value;
      }

      if (room.value.type === "golden" || room.value.type === "passage") {
        goalRoom = room.value;
      }

      if (room.value.deadEnd) {
        deadEndRooms.push(room.value);
      }
    }

    if (!startRoom || !goalRoom) {
      throw new Error("the level requires start and goal rooms");
    }

    const neighbors = (room: Room) => this.getConnectedRooms(room);
    const isGoalRoom = (room: Room) => room === goalRoom;

    // find the main path to the goal
    const mainPath = findPathUntil(startRoom, neighbors, isGoalRoom);
    for (let i = 0; i < mainPath.length - 1; i++) {
      const currRoom = mainPath[i];
      const nextRoom = mainPath[i + 1];
      currRoom.correctPathAngle = angleBetweenPoints(
        currRoom.x,
        currRoom.y,
        nextRoom.x,
        nextRoom.y
      );
    }

    if (mainPath.length > 1) {
      const lastIndex = mainPath.length - 1;

      // keep the angle of the path in the golden
      // room the same as in the room before it
      mainPath[lastIndex].correctPathAngle =
        mainPath[lastIndex - 1].correctPathAngle;
    }

    // find all ways back to the main
    // path from the remaining dead ends
    const hasCorrectPathAssigned = (room: Room) =>
      room.correctPathAngle !== Room.unassignedCorrectPathAngle;

    for (const room of deadEndRooms) {
      if (room.correctPathAngle !== Room.unassignedCorrectPathAngle) {
        continue;
      }

      const pathBack = findPathUntil(room, neighbors, hasCorrectPathAssigned);
      for (let i = 0; i < pathBack.length - 1; i++) {
        const currRoom = pathBack[i];
        const nextRoom = pathBack[i + 1];
        currRoom.correctPathAngle = angleBetweenPoints(
          currRoom.x,
          currRoom.y,
          nextRoom.x,
          nextRoom.y
        );
      }
    }

    return this;
  }
}
