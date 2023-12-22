import { Level, Room } from "../core";

export function breadthFirstSearch(level: Level, room: Room) {
  const queue = [room];
  const visited = new Set<Room>();
  const result: Room[] = [];

  while (queue.length) {
    const current = queue.shift() as Room;

    if (!visited.has(current)) {
      visited.add(current);
      result.push(current);

      for (const neighbor of level.getAdjacentConnectedRooms(current)) {
        if (neighbor && neighbor !== current) {
          queue.push(neighbor);
        }
      }
    }
  }

  return result;
}
