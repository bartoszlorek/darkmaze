import { Room, Level } from "../core";
import {
  arrayRemove,
  arrayRandomItem,
  createRandomNumber,
  findFarthestNode,
  findPathUntil,
} from "../helpers";
import { generateRoomsLayout } from "./generateRoomsLayout";

const RETRIES_LIMIT = 100;

export function generateLevel(dimension: number, seed: string): Level {
  const randomNumber = createRandomNumber(seed);

  let retries = RETRIES_LIMIT;
  let bestLevel: Level | null = null;

  while (--retries > 0) {
    const rooms = generateRoomsLayout({ dimension, randomNumber });
    const deadEndRooms = rooms.filter((room) => room.deadEnd);

    const level = new Level(rooms);
    const neighbors = (room: Room) => level.getConnectedRooms(room);

    // find a random starting room
    const startRoom = arrayRandomItem(deadEndRooms, randomNumber()) as Room;
    startRoom.type = "start";
    arrayRemove(deadEndRooms, startRoom);

    // find the golden room furthest from the start
    const goldenRoom = findFarthestNode(startRoom, neighbors);
    goldenRoom.type = "golden";
    arrayRemove(deadEndRooms, goldenRoom);

    // set the remaining rooms as evil
    for (const room of deadEndRooms) {
      room.type = "evil";
    }

    // evaluate difficulty
    let evilRoomsOnThePath = 0;
    const mainPath = findPathUntil(startRoom, neighbors, Room.isGolden);

    for (const room of mainPath) {
      for (const other of level.getConnectedRooms(room)) {
        if (Room.isEvil(other)) {
          evilRoomsOnThePath += 1;
        }
      }
    }

    level.difficulty = (evilRoomsOnThePath / mainPath.length) * dimension;
    if (!bestLevel || level.difficulty > bestLevel.difficulty) {
      bestLevel = level;
    }
  }

  if (!bestLevel || bestLevel.difficulty === 0) {
    throw new Error("the generated level is not difficult enough");
  }

  bestLevel.difficulty = Math.floor(bestLevel.difficulty * 100) / 100;
  bestLevel.updateCorrectPaths();
  return bestLevel;
}
