import { Level, Room } from "../core";

/**
 * @see https://stackoverflow.com/a/62315179
 * @see https://en.wikipedia.org/wiki/Breadth-first_search
 */
export function findFarthestRoom(level: Level, initialRoom: Room) {
  const queue = [initialRoom];
  const visitedRooms = new Set<Room>();

  while (queue.length > 0) {
    const current = queue.shift() as Room;

    if (!visitedRooms.has(current)) {
      visitedRooms.add(current);

      for (const neighbor of level.getAdjacentConnectedRooms(current)) {
        if (neighbor && neighbor !== current) {
          queue.push(neighbor);
        }
      }
    }
  }

  const array = Array.from(visitedRooms);
  return array[array.length - 1];
}
