import * as PIXI from "pixi.js";
import { LoadedSpritesheets } from "./assets";
import { Level, Room, WallState } from "./core";
import { DEBUG_MODE } from "./debug";
import { createDebugger } from "./debugger";
import {
  DirectionIndex,
  DrawFunction,
  Grid,
  NeighborIndex,
  Neighbors,
  Pool,
} from "./helpers";

/**
 * @see https://code.tutsplus.com/how-to-use-tile-bitmasking-to-auto-tile-your-level-layouts--cms-25673t
 */
// prettier-ignore
type BitIndex =
  | 0  | 1  | 2  | 3
  | 4  | 5  | 6  | 7
  | 8  | 9  | 10 | 11
  | 12 | 13 | 14 | 15;

interface TileDisplay {
  uniqueId: string;
  randomId: number;
  wallIndex: BitIndex | -1;
  floorIndex: BitIndex;
  actualX: number;
  actualY: number;
}

export const drawLevel: DrawFunction<
  {
    level: Level;
    gridSize: number;
    sprites: LoadedSpritesheets;
    debugMode: DEBUG_MODE;
  },
  [revealed: boolean]
> = ({ parent, level, gridSize, sprites, debugMode }) => {
  const tex = sprites.world.textures;
  const wallTextures: Record<BitIndex, PIXI.Texture[]> = {
    0: [tex.walls_3b],
    1: [tex.walls_4b],
    2: [tex.walls_5d],
    3: [tex.walls_5d],
    4: [tex.walls_1d],
    5: [tex.walls_1d],
    6: [tex.walls_2a, tex.walls_2d, tex.walls_3a, tex.walls_3d, tex.walls_4d],
    7: [tex.walls_2a, tex.walls_2d, tex.walls_3a, tex.walls_3d, tex.walls_4d],
    8: [tex.walls_4c],
    9: [tex.walls_1b, tex.walls_1c, tex.walls_5b, tex.walls_5c],
    10: [tex.walls_5a],
    11: [tex.walls_5a],
    12: [tex.walls_1a],
    13: [tex.walls_1a],
    14: [tex.walls_4a],
    15: [],
  };

  const floorTextures: Record<BitIndex, PIXI.Texture[]> = {
    0: [],
    1: [],
    2: [],
    3: [tex.floor_4d],
    4: [],
    5: [tex.floor_1d],
    6: [],
    7: [tex.floor_2d, tex.floor_3d],
    8: [],
    9: [],
    10: [tex.floor_4a],
    11: [tex.floor_4b, tex.floor_4c],
    12: [tex.floor_1a],
    13: [tex.floor_1b, tex.floor_1c],
    14: [tex.floor_2a, tex.floor_3a],
    15: [tex.floor_2b, tex.floor_2c, tex.floor_3b, tex.floor_3c],
  };

  const tileDisplays = new Map<string, TileDisplay>();
  const tileStates = new Grid<WallState>(
    level.dimension * 2 + 1,
    level.dimension * 2 + 1
  );

  const halfGridSize = gridSize / 2;
  const wallsLayer = new PIXI.Container();
  const floorLayer = new PIXI.Container();
  const itemsLayer = new PIXI.Container();
  wallsLayer.x = floorLayer.x = halfGridSize / 2;
  wallsLayer.y = floorLayer.y = halfGridSize;

  const wallsSprites = new Pool(
    () => {
      const sprite = new PIXI.Sprite();
      wallsLayer.addChild(sprite);
      return sprite;
    },
    (sprite) => {
      sprite.destroy();
    }
  );

  const floorSprites = new Pool(
    () => {
      const sprite = new PIXI.Sprite();
      floorLayer.addChild(sprite);
      return sprite;
    },
    (sprite) => {
      sprite.destroy();
    }
  );

  const itemsSprites = new Pool(
    () => {
      const sprite = new PIXI.Sprite();
      itemsLayer.addChild(sprite);
      return sprite;
    },
    (sprite) => {
      sprite.destroy();
    }
  );

  // temporarily build level grid
  const levelGrid = new Grid<Room>(level.dimension, level.dimension);
  for (const room of level.rooms) {
    levelGrid.setValue(room.x, room.y, room);
  }

  // preallocated array memory
  // prettier-ignore
  const _tileStatesNeighbors: Neighbors<WallState> = [
    null, null, null,
    null,       null,
    null, null, null,
  ];

  level.subscribe("room_explore", ({ room }: { room: Room }) => {
    const x = tileStates.transformX(room.x, levelGrid);
    const y = tileStates.transformY(room.y, levelGrid);

    // previous row
    tileStates.setValue(x - 1, y - 1, WallState.closed);
    tileStates.setValue(x, y - 1, room.walls[DirectionIndex.up]);
    tileStates.setValue(x + 1, y - 1, WallState.closed);

    // current row
    tileStates.setValue(x - 1, y, room.walls[DirectionIndex.left]);
    tileStates.setValue(x, y, WallState.open);
    tileStates.setValue(x + 1, y, room.walls[DirectionIndex.right]);

    // next row
    tileStates.setValue(x - 1, y + 1, WallState.closed);
    tileStates.setValue(x, y + 1, room.walls[DirectionIndex.down]);
    tileStates.setValue(x + 1, y + 1, WallState.closed);

    // regenerates every bitIndex of walls and the floor
    tileStates.forEach((x, y, value) => {
      const neighbors = tileStates.neighbors(x, y, _tileStatesNeighbors);

      let wallIndex = 0;
      if (value === WallState.closed) {
        if (neighbors[NeighborIndex.up]) wallIndex += 1;
        if (neighbors[NeighborIndex.left]) wallIndex += 2;
        if (neighbors[NeighborIndex.right]) wallIndex += 4;
        if (neighbors[NeighborIndex.down]) wallIndex += 8;
      } else {
        wallIndex = -1;
      }

      let floorIndex = 0;
      if (neighbors[NeighborIndex.up] !== null) floorIndex += 1;
      if (neighbors[NeighborIndex.left] !== null) floorIndex += 2;
      if (neighbors[NeighborIndex.right] !== null) floorIndex += 4;
      if (neighbors[NeighborIndex.down] !== null) floorIndex += 8;

      const uniqueId = `${x},${y}`;
      const tile = tileDisplays.get(uniqueId);

      if (tile === undefined) {
        tileDisplays.set(uniqueId, {
          uniqueId,
          randomId: Math.floor(Math.random() * 100000),
          wallIndex: wallIndex as BitIndex,
          floorIndex: floorIndex as BitIndex,
          actualX: x * halfGridSize,
          actualY: y * halfGridSize,
        });
      } else {
        tile.wallIndex = wallIndex as BitIndex;
        tile.floorIndex = floorIndex as BitIndex;
      }
    });
  });

  parent.addChild(floorLayer);
  parent.addChild(wallsLayer);
  parent.addChild(itemsLayer);

  const debug = createDebugger();
  parent.addChild(debug.layer);

  return () => {
    for (const room of level.rooms) {
      if (debugMode === DEBUG_MODE.VISITED_CONNECTED) {
        debug.print(
          room.visitedConnectedRooms,
          room.x * gridSize + gridSize / 2,
          room.y * gridSize + gridSize / 2
        );
      } else if (debugMode === DEBUG_MODE.EXPLORED_CONNECTED) {
        debug.print(
          room.exploredConnectedRooms,
          room.x * gridSize + gridSize / 2,
          room.y * gridSize + gridSize / 2
        );
      }
    }

    for (const tile of tileDisplays.values()) {
      if (debugMode === DEBUG_MODE.WALLS_INDEX) {
        debug.print(
          String(tile.wallIndex),
          tile.actualX + halfGridSize,
          tile.actualY + halfGridSize + halfGridSize / 2,
          10
        );
      } else if (debugMode === DEBUG_MODE.FLOOR_INDEX) {
        debug.print(
          String(tile.floorIndex),
          tile.actualX + halfGridSize,
          tile.actualY + halfGridSize + halfGridSize / 2,
          10
        );
      }

      if (tile.wallIndex !== -1) {
        const sprite = wallsSprites.get(tile.uniqueId);
        const wallVariants = wallTextures[tile.wallIndex];
        sprite.texture = wallVariants[tile.randomId % wallVariants.length];
        sprite.x = tile.actualX;
        sprite.y = tile.actualY;
      }

      const sprite = floorSprites.get(tile.uniqueId);
      const floorVariants = floorTextures[tile.floorIndex];
      sprite.texture = floorVariants[tile.randomId % floorVariants.length];
      sprite.x = tile.actualX;
      sprite.y = tile.actualY;
    }

    for (const room of level.rooms) {
      if (room.explored) {
        const roomKey = `${room.x},${room.y}`;

        switch (room.type) {
          case "evil": {
            const sprite = itemsSprites.get(roomKey);
            sprite.texture = tex.room_evil;
            sprite.x = room.x * gridSize;
            sprite.y = room.y * gridSize;
            break;
          }

          case "golden": {
            const sprite = itemsSprites.get(roomKey);
            sprite.texture = tex.room_golden;
            sprite.x = room.x * gridSize;
            sprite.y = room.y * gridSize;
            break;
          }

          case "passage": {
            const sprite = itemsSprites.get(roomKey);
            sprite.texture = tex.room_passage;
            sprite.x = room.x * gridSize;
            sprite.y = room.y * gridSize;
            break;
          }
        }
      }
    }

    wallsSprites.afterAll();
    floorSprites.afterAll();
    itemsSprites.afterAll();
    debug.afterAll();
  };
};
