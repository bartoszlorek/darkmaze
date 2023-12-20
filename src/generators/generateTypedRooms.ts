import { Room } from "../Room";
import { arrayRemove, arrayRandomItem } from "../utils";
import { generateEmptyRoomsRetry } from "./generateEmptyRooms";

export function generateRooms(dimension: number, seed: string): Room[] {
  console.log({ seed });

  const emptyRooms = generateEmptyRoomsRetry({
    dimension,
    requiredDeadEndCount: 3,
  });

  const deadEndRooms = emptyRooms.filter((room) => room.deadEnd);

  // find the golden room
  const goldenRoom = arrayRandomItem(deadEndRooms) as Room;
  goldenRoom.type = "golden";
  arrayRemove(deadEndRooms, goldenRoom);

  // find the starting room
  const startRoom = arrayRandomItem(deadEndRooms) as Room;
  startRoom.type = "start";
  arrayRemove(deadEndRooms, startRoom);

  // set the remaining rooms as evil
  for (let i = 0; i < deadEndRooms.length; i++) {
    deadEndRooms[i].type = "evil";
  }

  return emptyRooms;
}
