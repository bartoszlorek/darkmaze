import { Level, Player } from "./core";
import { Direction4Angle } from "./helpers";

export function createPlayer(level: Level, alignToRoom: boolean): Player {
  let startingRoom;
  for (const room of level.rooms.values()) {
    if (room.value.type === "start") {
      startingRoom = room.value;
      break;
    }
  }

  if (!startingRoom) {
    throw new Error("there is no start room for the player");
  }

  if (!alignToRoom) {
    return new Player(startingRoom.x, startingRoom.y, 0);
  }

  let openWallAngle = 0;
  if (!startingRoom.walls.up) {
    openWallAngle = Direction4Angle.up;
  } else if (!startingRoom.walls.right) {
    openWallAngle = Direction4Angle.right;
  } else if (!startingRoom.walls.down) {
    openWallAngle = Direction4Angle.down;
  } else if (!startingRoom.walls.left) {
    openWallAngle = Direction4Angle.left;
  }

  return new Player(startingRoom.x, startingRoom.y, openWallAngle);
}
