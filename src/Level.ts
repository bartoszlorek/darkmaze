import { Room } from "./Room";

export class Level {
  public rooms: Room[];

  constructor(rooms: Room[]) {
    this.rooms = rooms;
  }
}
