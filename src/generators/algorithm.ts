import { arrayRemove, arrayRandomItem } from "../utils";
import { Room } from "../Room";

export function generateRooms(dimension: number): Room[] {
  let retriesLimit = 100;
  let deadEndCount = 0;
  let rooms: Room[] = [];

  while (deadEndCount < 3) {
    rooms = generateEmptyRooms(dimension);
    deadEndCount = rooms.reduce((sum, room) => {
      return sum + Number(room.deadEnd);
    }, 0);

    if (--retriesLimit === 0) {
      throw new Error("rooms generation has reached the limit");
    }
  }

  const deadEndRooms = rooms.filter((room) => room.deadEnd);

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

  return rooms;
}

const roomKey = (x: number, y: number) => `${x}-${y}`;

// https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_implementation
export function generateEmptyRooms(dimension: number): Room[] {
  const visitedRooms = new Set<Room>();
  const roomsMap = new Map<string, Room>();

  for (let y = 0; y < dimension; y++) {
    for (let x = 0; x < dimension; x++) {
      const room = new Room(x, y, [1, 1, 1, 1]);
      roomsMap.set(roomKey(x, y), room);
    }
  }

  const backtracking = [];
  let currentRoom = roomsMap.get(roomKey(0, 0)) as Room;
  let visited = 1;

  while (visited < roomsMap.size) {
    visitedRooms.add(currentRoom);

    const nextRoom = getUnvisitedNeighbor(currentRoom, roomsMap, visitedRooms);
    if (nextRoom) {
      removeWallBetween(currentRoom, nextRoom);
      backtracking.push(currentRoom);
      visitedRooms.add(nextRoom);

      // try the next room
      currentRoom = nextRoom;
      visited += 1;
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

function getUnvisitedNeighbor(
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

  return arrayRandomItem(neighbors);
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
