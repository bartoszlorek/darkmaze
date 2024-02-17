import { Room, Level } from "../core";
import {
  arrayRemove,
  arrayRandomItem,
  createRandomNumber,
  findFarthestNode,
} from "../helpers";
import { generateRoomsLayout } from "./generateRoomsLayout";

const RETRIES_LIMIT = 100;
const REQUIRED_DEAD_ENDS = 3;

export function generateLevel(dimension: number, seed: string): Level {
  const randomNumber = createRandomNumber(seed);

  let retries = 0;
  let rooms: Room[] = [];
  let deadEndRooms: Room[] = [];

  // 1. generates rooms layout
  while (deadEndRooms.length < REQUIRED_DEAD_ENDS) {
    rooms = generateRoomsLayout({ dimension, randomNumber });
    deadEndRooms = rooms.filter((room) => room.deadEnd);

    if (retries > RETRIES_LIMIT) {
      throw new Error("rooms generation has reached the limit");
    }
    retries += 1;
  }

  // 2. populates the level
  const level = new Level(rooms);
  const neighbors = (room: Room) => level.getConnectedRooms(room);

  // 3. find a random starting room
  const startRoom = arrayRandomItem(deadEndRooms, randomNumber()) as Room;
  startRoom.type = "start";
  arrayRemove(deadEndRooms, startRoom);

  // 4. find the room furthest from the starting one,
  //    which will be the goal of the level
  const goldenRoom = findFarthestNode(startRoom, neighbors);
  goldenRoom.type = "golden";
  arrayRemove(deadEndRooms, goldenRoom);

  // 5. set the remaining rooms as evil
  for (const room of deadEndRooms) {
    room.type = "evil";
  }

  // 6. define all paths to the goal
  level.updateCorrectPaths();
  return level;
}
