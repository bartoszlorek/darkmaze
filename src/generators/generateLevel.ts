import { Room, Level } from "../core";
import { arrayRemove, arrayRandomItem, createRandomNumber } from "../helpers";
import { findFarthestRoom } from "./findFarthestRoom";
import { generateRoomsLayout } from "./generateRoomsLayout";

const RETRIES_LIMIT = 100;
const REQUIRED_DEAD_ENDS = 3;

export function generateLevel(dimension: number, seed: string): Level {
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

  // starts populating the level
  const level = new Level(rooms);

  // 1. find a random starting room
  const startRoom = arrayRandomItem(deadEndRooms, randomNumber()) as Room;
  startRoom.type = "start";
  arrayRemove(deadEndRooms, startRoom);

  // 2. find the room farthest from the starting one,
  // which will be the goal of the level
  const goldenRoom = findFarthestRoom(level, startRoom);
  goldenRoom.type = "golden";
  arrayRemove(deadEndRooms, goldenRoom);

  // 3. set the remaining rooms as evil
  for (let i = 0; i < deadEndRooms.length; i++) {
    deadEndRooms[i].type = "evil";
  }

  return level;
}
