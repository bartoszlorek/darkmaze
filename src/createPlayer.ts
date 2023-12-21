import { Level, Player } from "./core";

export function createPlayer(level: Level): Player {
  const startingRoom = level.rooms.find((a) => a.type === "start");
  if (!startingRoom) {
    throw new Error("there is no start room for the player");
  }

  // TODO: change the player's angle depending
  // on the entrance to the DeadEnd room
  return new Player(startingRoom.x, startingRoom.y, 0);
}
