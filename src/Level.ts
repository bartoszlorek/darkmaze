import { Room } from "./Room";
import { Player } from "./Player";
import { EventEmitter } from "./EventEmitter";

export type LevelEvents = {
  room_enter: { room: Room };
  room_leave: { room: Room };
  room_explore: { room: Room };
};

export class Level extends EventEmitter<LevelEvents> {
  public rooms: Room[];
  public dimension: number;

  protected lastVisitedRoom: Room | null = null;

  constructor(rooms: Room[]) {
    super();
    this.rooms = rooms;
    this.dimension = Math.sqrt(rooms.length);
  }

  public findCurrentRoom(player: Player) {
    if (this.lastVisitedRoom?.contains(player.x, player.y)) {
      return this.lastVisitedRoom;
    }

    const currentRoom = this.rooms.find((a) => a.contains(player.x, player.y));
    if (currentRoom === undefined) {
      throw new Error("the player is outside the level");
    }

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
}
