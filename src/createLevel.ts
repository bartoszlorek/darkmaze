import { Room } from "./Room";

export type LevelData = Readonly<{
  rooms: Room[];
}>;

export function createLevel(): LevelData {
  const rooms = [
    new Room(0, 0, [1, 0, 0, 1]),
    new Room(1, 0, [1, 0, 1, 0]),
    new Room(2, 0, [1, 1, 0, 0]),

    new Room(0, 1, [0, 0, 1, 1]),
    new Room(1, 1, [1, 1, 1, 0]),
    new Room(2, 1, [0, 1, 0, 1]),

    new Room(0, 2, [1, 0, 1, 1]),
    new Room(1, 2, [1, 0, 1, 0]),
    new Room(2, 2, [0, 1, 1, 0]),
  ];

  return {
    rooms,
  };
}
