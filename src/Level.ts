import { Room } from "./Room";
import { Player } from "./Player";

export class Level {
  public rooms: Room[];
  public dimension: number;

  protected lastVisitedRoom: Room | null = null;
  protected exploredRoomsCount: number = 0;

  constructor(rooms: Room[]) {
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

    // the first time
    if (this.lastVisitedRoom === null) {
      this.lastVisitedRoom = currentRoom;
      return currentRoom;
    }

    // the room exploration is moving from
    // one unexplored room to another
    if (!this.lastVisitedRoom.explored && !currentRoom.explored) {
      this.lastVisitedRoom.explored = true;
      this.exploredRoomsCount += 1;
    }

    // the last room on the level
    if (this.exploredRoomsCount === this.rooms.length - 1) {
      currentRoom.explored = true;
    }

    this.lastVisitedRoom = currentRoom;
    return currentRoom;
  }
}
