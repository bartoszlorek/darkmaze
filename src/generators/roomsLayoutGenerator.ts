import { arrayRandomItem } from "../helpers";
import { Room } from "../core";

const roomKey = (x: number, y: number) => `${x}-${y}`;

/**
 * All generated rooms are empty without a gameplay logic.
 * @see https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_implementation
 */
export function generateRoomsLayout({
  dimension,
  randomNumber,
}: {
  dimension: number;
  randomNumber: () => number;
}): Room[] {
  const backtracking = [];
  const visitedRooms = new Set<Room>();
  const roomsMap = new Map<string, Room>();

  for (let y = 0; y < dimension; y++) {
    for (let x = 0; x < dimension; x++) {
      const room = new Room(x, y, [1, 1, 1, 1]);
      roomsMap.set(roomKey(x, y), room);
    }
  }

  let currentRoom = roomsMap.get(roomKey(0, 0)) as Room;
  while (visitedRooms.size < roomsMap.size) {
    visitedRooms.add(currentRoom);

    const nextRoom = arrayRandomItem(
      getUnvisitedNeighbors(currentRoom, roomsMap, visitedRooms),
      randomNumber()
    );

    if (nextRoom) {
      removeWallBetween(currentRoom, nextRoom);
      backtracking.push(currentRoom);
      visitedRooms.add(nextRoom);

      // starts from the next room
      currentRoom = nextRoom;
    } else if (backtracking.length > 0) {
      currentRoom = backtracking.pop() as Room;
    }
  }

  const rooms = Array.from(roomsMap.values());
  for (let i = 0; i < rooms.length; i++) {
    rooms[i].evaluate();
  }

  return rooms;
}

function getUnvisitedNeighbors(
  room: Room,
  roomsMap: Map<string, Room>,
  visitedRooms: Set<Room>
) {
  const neighbors: Room[] = [];
  const top = roomsMap.get(roomKey(room.x, room.y - 1));
  const right = roomsMap.get(roomKey(room.x + 1, room.y));
  const bottom = roomsMap.get(roomKey(room.x, room.y + 1));
  const left = roomsMap.get(roomKey(room.x - 1, room.y));

  if (top && !visitedRooms.has(top)) {
    neighbors.push(top);
  }
  if (right && !visitedRooms.has(right)) {
    neighbors.push(right);
  }
  if (bottom && !visitedRooms.has(bottom)) {
    neighbors.push(bottom);
  }
  if (left && !visitedRooms.has(left)) {
    neighbors.push(left);
  }

  return neighbors;
}

function removeWallBetween(a: Room, b: Room) {
  const x = a.x - b.x;
  const y = a.y - b.y;

  if (x === 1) {
    a.walls[3] = 0;
    b.walls[1] = 0;
  } else if (x === -1) {
    a.walls[1] = 0;
    b.walls[3] = 0;
  }

  if (y === 1) {
    a.walls[0] = 0;
    b.walls[2] = 0;
  } else if (y === -1) {
    a.walls[2] = 0;
    b.walls[0] = 0;
  }
}
