import { arrayRandomItem } from "../helpers";
import { Room } from "../core";

const roomKey = (x: number, y: number) => `${x},${y}`;

/**
 * All generated rooms are empty.
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
      roomsMap.set(
        roomKey(x, y),
        new Room(x, y).setWalls({
          up: true,
          left: true,
          right: true,
          down: true,
        })
      );
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

      currentRoom = nextRoom;
    } else if (backtracking.length > 0) {
      currentRoom = backtracking.pop() as Room;
    }
  }

  return [...roomsMap.values()];
}

function getUnvisitedNeighbors(
  room: Room,
  roomsMap: Map<string, Room>,
  visitedRooms: Set<Room>
) {
  const neighbors: Room[] = [];
  const top = roomsMap.get(roomKey(room.x, room.y - 1));
  const left = roomsMap.get(roomKey(room.x - 1, room.y));
  const right = roomsMap.get(roomKey(room.x + 1, room.y));
  const bottom = roomsMap.get(roomKey(room.x, room.y + 1));

  if (top && !visitedRooms.has(top)) neighbors.push(top);
  if (left && !visitedRooms.has(left)) neighbors.push(left);
  if (right && !visitedRooms.has(right)) neighbors.push(right);
  if (bottom && !visitedRooms.has(bottom)) neighbors.push(bottom);

  return neighbors;
}

function removeWallBetween(a: Room, b: Room) {
  const diffX = a.x - b.x;
  const diffY = a.y - b.y;

  if (diffX > 0) {
    a.setWalls({ left: false });
    b.setWalls({ right: false });
  } else if (diffX < 0) {
    a.setWalls({ right: false });
    b.setWalls({ left: false });
  }

  if (diffY > 0) {
    a.setWalls({ up: false });
    b.setWalls({ down: false });
  } else if (diffY < 0) {
    a.setWalls({ down: false });
    b.setWalls({ up: false });
  }
}
