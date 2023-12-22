import { Room, Level } from "../core";
import { arrayRemove, arrayRandomItem, createRandomNumber } from "../helpers";
import { generateRoomsLayout } from "./roomsLayoutGenerator";
import { breadthFirstSearch } from "./breadthFirstSearch";

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

  // find the starting room
  const startRoom = arrayRandomItem(deadEndRooms, randomNumber()) as Room;
  startRoom.type = "start";
  arrayRemove(deadEndRooms, startRoom);

  // find the farthest room from the starting one
  const tempLevel = new Level(rooms);
  const bfs = breadthFirstSearch(tempLevel, startRoom);

  // find the golden room
  const goldenRoom = bfs[bfs.length - 1];
  goldenRoom.type = "golden";
  arrayRemove(deadEndRooms, goldenRoom);

  // set the remaining rooms as evil
  for (let i = 0; i < deadEndRooms.length; i++) {
    deadEndRooms[i].type = "evil";
  }

  return rooms;
}
