import { Room } from "../Room";
import { arrayRemove, arrayRandomItem, createRandomNumber } from "../utils";
import { generateRoomsLayout } from "./roomsLayoutGenerator";

const RETRIES_LIMIT = 100;
const REQUIRED_DEAD_ENDS = 3;

export function generateRooms(dimension: number, seed: string): Room[] {
  const randomNumber = createRandomNumber(seed);

  let retries = 0;
  let rooms: Room[] = [];
  let deadEndRooms: Room[] = [];

  while (deadEndRooms.length < REQUIRED_DEAD_ENDS) {
    rooms = generateRoomsLayout({ dimension, randomNumber });
    deadEndRooms = rooms.filter((room) => room.deadEnd);

    if (retries > RETRIES_LIMIT) {
      throw new Error("rooms generation has reached the limit");
    }
    retries += 1;
  }

  // find the golden room
  const goldenRoom = arrayRandomItem(deadEndRooms, randomNumber()) as Room;
  goldenRoom.type = "golden";
  arrayRemove(deadEndRooms, goldenRoom);

  // find the starting room
  const startRoom = arrayRandomItem(deadEndRooms, randomNumber()) as Room;
  startRoom.type = "start";
  arrayRemove(deadEndRooms, startRoom);

  // set the remaining rooms as evil
  for (let i = 0; i < deadEndRooms.length; i++) {
    deadEndRooms[i].type = "evil";
  }

  return rooms;
}
