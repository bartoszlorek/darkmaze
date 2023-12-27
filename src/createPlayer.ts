import { Level, Player, WallState } from "./core";
import { angleFromDirectionIndex } from "./helpers";

export function createPlayer(level: Level, alignToRoom: boolean): Player {
  const startingRoom = level.rooms.find((a) => a.type === "start");
  if (!startingRoom) {
    throw new Error("there is no start room for the player");
  }

  if (!alignToRoom) {
    return new Player(startingRoom.x, startingRoom.y, 0);
  }

  const openWallAngle = angleFromDirectionIndex(
    startingRoom.walls.findIndex((a) => a === WallState.open)
  );

  return new Player(startingRoom.x, startingRoom.y, openWallAngle);
}
