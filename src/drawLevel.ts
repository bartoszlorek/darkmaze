import * as PIXI from "pixi.js";
import { LoadedSpritesheets } from "./assets";
import { Level, Room } from "./core";
import { DEBUG_MODE } from "./debug";
import { createDebugger } from "./debugger";
import {
  BitMaskValue,
  DrawFunction,
  GridCell,
  GridMap,
  Pool,
  createBitMask,
  createEmptyNeighbors8,
} from "./helpers";

enum TileState {
  floor = 0,
  walls = 1,
}

interface TileDisplay {
  uniqueId: string;
  randomId: number;
  wallIndex: BitMaskValue | -1;
  floorIndex: BitMaskValue;
  actualX: number;
  actualY: number;
}

export const drawLevel: DrawFunction<{
  level: Level;
  gridSize: number;
  sprites: LoadedSpritesheets;
  debugMode: DEBUG_MODE;
}> = ({ parent, level, gridSize, sprites, debugMode }) => {
  const tex = sprites.world.textures;
  const wallTextures: Record<BitMaskValue, PIXI.Texture[]> = {
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

  const floorTextures: Record<BitMaskValue, PIXI.Texture[]> = {
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
  const tileStates = new GridMap<TileState>(
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

  // preallocated array memory
  const _tileStatesNeighbors = createEmptyNeighbors8<GridCell<TileState>>();

  level.subscribe("room_explore", ({ room }: { room: Room }) => {
    const x = tileStates.transformX(room.x, level.rooms);
    const y = tileStates.transformY(room.y, level.rooms);

    const upState = room.walls.up ? TileState.walls : TileState.floor;
    const leftState = room.walls.left ? TileState.walls : TileState.floor;
    const rightState = room.walls.right ? TileState.walls : TileState.floor;
    const downState = room.walls.down ? TileState.walls : TileState.floor;

    // previous row
    tileStates.setValue(x - 1, y - 1, TileState.walls);
    tileStates.setValue(x, y - 1, upState);
    tileStates.setValue(x + 1, y - 1, TileState.walls);

    // current row
    tileStates.setValue(x - 1, y, leftState);
    tileStates.setValue(x, y, TileState.floor);
    tileStates.setValue(x + 1, y, rightState);

    // next row
    tileStates.setValue(x - 1, y + 1, TileState.walls);
    tileStates.setValue(x, y + 1, downState);
    tileStates.setValue(x + 1, y + 1, TileState.walls);

    // regenerates every bitIndex of walls and the floor
    for (const { x, y, value } of tileStates.values()) {
      const n = tileStates.neighbors(x, y, _tileStatesNeighbors);

      const wallIndex =
        value === TileState.walls
          ? createBitMask(
              n.up?.value === TileState.walls ? 1 : 0,
              n.left?.value === TileState.walls ? 1 : 0,
              n.right?.value === TileState.walls ? 1 : 0,
              n.down?.value === TileState.walls ? 1 : 0
            )
          : -1;

      const floorIndex = createBitMask(
        n.up !== null ? 1 : 0,
        n.left !== null ? 1 : 0,
        n.right !== null ? 1 : 0,
        n.down !== null ? 1 : 0
      );

      const uniqueId = `${x},${y}`;
      const tile = tileDisplays.get(uniqueId);
      if (tile === undefined) {
        tileDisplays.set(uniqueId, {
          uniqueId,
          randomId: Math.floor(Math.random() * 100000),
          wallIndex,
          floorIndex,
          actualX: x * halfGridSize,
          actualY: y * halfGridSize,
        });
      } else {
        tile.wallIndex = wallIndex;
        tile.floorIndex = floorIndex;
      }
    }
  });

  parent.addChild(floorLayer);
  parent.addChild(wallsLayer);
  parent.addChild(itemsLayer);

  const debug = createDebugger();
  parent.addChild(debug.layer);

  return () => {
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

    for (const { x, y, value: room } of level.rooms.values()) {
      if (debugMode === DEBUG_MODE.VISITED_CONNECTED) {
        debug.print(
          room.visitedConnectedRooms,
          x * gridSize + gridSize / 2,
          y * gridSize + gridSize / 2
        );
      } else if (debugMode === DEBUG_MODE.EXPLORED_CONNECTED) {
        debug.print(
          room.exploredConnectedRooms,
          x * gridSize + gridSize / 2,
          y * gridSize + gridSize / 2
        );
      }

      if (room.explored) {
        const roomKey = `${x},${y}`;

        switch (room.type) {
          case "evil": {
            const sprite = itemsSprites.get(roomKey);
            sprite.texture = tex.room_evil;
            sprite.x = x * gridSize;
            sprite.y = y * gridSize;
            break;
          }

          case "golden": {
            const sprite = itemsSprites.get(roomKey);
            sprite.texture = tex.room_golden;
            sprite.x = x * gridSize;
            sprite.y = y * gridSize;
            break;
          }

          case "passage": {
            const sprite = itemsSprites.get(roomKey);
            sprite.texture = tex.room_passage;
            sprite.x = x * gridSize;
            sprite.y = y * gridSize;
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
