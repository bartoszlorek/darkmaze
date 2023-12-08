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
  protected exploredRoomsCount: number = 0;

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

    // the room exploration is moving from
    // one unexplored room to another
    if (!this.lastVisitedRoom.explored && !currentRoom.explored) {
      this.lastVisitedRoom.explored = true;
      this.exploredRoomsCount += 1;
      this.emit("room_explore", {
        room: this.lastVisitedRoom,
      });
    }

    // the last room on the level
    if (this.exploredRoomsCount === this.rooms.length - 1) {
      currentRoom.explored = true;
      this.exploredRoomsCount += 1;
      this.emit("room_explore", {
        room: currentRoom,
      });
    }

    this.lastVisitedRoom = currentRoom;
    return currentRoom;
  }
}
