import * as PIXI from "pixi.js";
import { LoadedSpritesheets } from "../assets";
import { Level, Room } from "../core";
import { DEBUG_MODE } from "../debug";
import {
  Bit4MaskValue,
  Bit8MaskValue,
  GridCell,
  GridMap,
  Pool,
  createBit4Mask,
  createBit8Mask,
  createEmptyNeighbors8,
} from "../helpers";
import { createDebugger } from "./debugger";
import { DrawFunction } from "./draw";

const TILES_MARGIN = 1;

enum TileState {
  floor = 0,
  walls = 1,
}

export const drawLevel: DrawFunction<{
  level: Level;
  gridSize: number;
  sprites: LoadedSpritesheets;
  debugMode: DEBUG_MODE;
}> = ({ parent, level, gridSize, sprites, debugMode }) => {
  const halfGridSize = gridSize / 2;
  const wallTextures = createWallTextures(sprites);
  const edgeTextures = createEdgeTextures(sprites);

  const tileStates = new GridMap<TileState>(
    level.dimension * 2 + TILES_MARGIN,
    level.dimension * 2 + TILES_MARGIN
  );

  const tilesLayer = new PIXI.Container();
  const wallsLayer = new PIXI.Container();
  const edgesLayer = new PIXI.Container();
  const itemsLayer = new PIXI.Container();

  tilesLayer.x = -(halfGridSize / 2);
  tilesLayer.addChild(wallsLayer);
  tilesLayer.addChild(edgesLayer);

  parent.addChild(tilesLayer);
  parent.addChild(itemsLayer);

  const debug = createDebugger();
  parent.addChild(debug.layer);

  const wallsSprites = new Pool(
    () => wallsLayer.addChild(new PIXI.Sprite()),
    (sprite) => sprite.destroy()
  );

  const edgesSprites = new Pool(
    () => edgesLayer.addChild(new PIXI.Sprite()),
    (sprite) => sprite.destroy()
  );

  const itemsSprites = new Pool(
    () => itemsLayer.addChild(new PIXI.Sprite()),
    (sprite) => sprite.destroy()
  );

  // preallocated array memory
  const _tileStatesNeighbors = createEmptyNeighbors8<GridCell<TileState>>();

  function renderTiles() {
    for (const { x, y, value } of tileStates.values()) {
      const uniqueId = `${x},${y}`;
      const variantId = Math.abs(x) + Math.abs(y);
      const neighbors = tileStates.neighbors(x, y, _tileStatesNeighbors);

      const wallIndex =
        value === TileState.walls
          ? createBit4Mask(
              neighbors.up?.value === TileState.walls ? 1 : 0,
              neighbors.left?.value === TileState.walls ? 1 : 0,
              neighbors.right?.value === TileState.walls ? 1 : 0,
              neighbors.down?.value === TileState.walls ? 1 : 0
            )
          : 0;

      const edgeIndex = tileStates.isEdgeCell(neighbors)
        ? createBit8Mask(
            neighbors.upLeft !== null ? 1 : 0,
            neighbors.up !== null ? 1 : 0,
            neighbors.upRight !== null ? 1 : 0,
            neighbors.left !== null ? 1 : 0,
            neighbors.right !== null ? 1 : 0,
            neighbors.downLeft !== null ? 1 : 0,
            neighbors.down !== null ? 1 : 0,
            neighbors.downRight !== null ? 1 : 0
          )
        : 0;

      const wallSprite = wallsSprites.get(uniqueId);
      const wallVariants = wallTextures[wallIndex];
      wallSprite.texture = wallVariants[variantId % wallVariants.length];

      const edgeSprite = edgesSprites.get(uniqueId);
      const edgeVariants = edgeTextures[edgeIndex];
      edgeSprite.texture = edgeVariants[variantId % edgeVariants.length];

      wallSprite.x = edgeSprite.x = x * halfGridSize;
      wallSprite.y = edgeSprite.y = y * halfGridSize;

      if (debugMode === DEBUG_MODE.WALLS_INDEX) {
        debug.print(
          String(wallIndex),
          x * halfGridSize + halfGridSize,
          y * halfGridSize + halfGridSize + halfGridSize / 2,
          10
        );
      } else if (debugMode === DEBUG_MODE.EDGES_INDEX) {
        debug.print(
          String(edgeIndex),
          x * halfGridSize + halfGridSize,
          y * halfGridSize + halfGridSize + halfGridSize / 2,
          12,
          edgeTextures[edgeIndex].length ? "white" : "red"
        );
      }
    }

    wallsSprites.afterAll();
    edgesSprites.afterAll();
  }

  let renderTimeout: NodeJS.Timeout;
  function requestTilesRender() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(renderTiles);
  }

  // draws the empty (floor-only) tiles for just visited rooms
  level.subscribe("room_visit", ({ room }: { room: Room }) => {
    if (!room.explored && room.visited) {
      const x = tileStates.transformX(room.x, level.rooms) + TILES_MARGIN;
      const y = tileStates.transformY(room.y, level.rooms) + TILES_MARGIN;

      // previous row
      tileStates.setIfNotValue(x - 1, y - 1, TileState.floor);
      tileStates.setIfNotValue(x, y - 1, TileState.floor);
      tileStates.setIfNotValue(x + 1, y - 1, TileState.floor);

      // current row
      tileStates.setIfNotValue(x - 1, y, TileState.floor);
      tileStates.setIfNotValue(x, y, TileState.floor);
      tileStates.setIfNotValue(x + 1, y, TileState.floor);

      // next row
      tileStates.setIfNotValue(x - 1, y + 1, TileState.floor);
      tileStates.setIfNotValue(x, y + 1, TileState.floor);
      tileStates.setIfNotValue(x + 1, y + 1, TileState.floor);

      requestTilesRender();
    }
  });

  const exploreRoom = ({ room }: { room: Room }) => {
    const x = tileStates.transformX(room.x, level.rooms) + TILES_MARGIN;
    const y = tileStates.transformY(room.y, level.rooms) + TILES_MARGIN;

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

    requestTilesRender();
  };

  level.subscribe("room_explore", exploreRoom);

  if (debugMode === DEBUG_MODE.ROOMS_LAYOUT) {
    for (const { value: room } of level.rooms.values()) {
      exploreRoom({ room });
    }
  }

  return () => {
    for (const { x, y, value: room } of level.rooms.values()) {
      if (debugMode === DEBUG_MODE.VISITED_CONNECTED) {
        debug.print(
          room.visitedConnectedRooms,
          x * gridSize + gridSize / 2,
          y * gridSize + gridSize / 2
        );
      }

      if (room.explored || debugMode === DEBUG_MODE.ROOMS_LAYOUT) {
        const roomKey = `${x},${y}`;
        switch (room.type) {
          case "evil": {
            const sprite = itemsSprites.get(roomKey);
            sprite.texture = sprites.items.textures.room_evil;
            sprite.x = x * gridSize;
            sprite.y = y * gridSize;
            break;
          }

          case "golden": {
            const sprite = itemsSprites.get(roomKey);
            sprite.texture = sprites.items.textures.room_golden;
            sprite.x = x * gridSize;
            sprite.y = y * gridSize;
            break;
          }

          case "passage": {
            const sprite = itemsSprites.get(roomKey);
            sprite.texture = sprites.items.textures.room_passage;
            sprite.x = x * gridSize;
            sprite.y = y * gridSize;
            break;
          }
        }
      }
    }

    itemsSprites.afterAll();

    if (debugMode === DEBUG_MODE.VISITED_CONNECTED) {
      debug.afterAll();
    }
  };
};

const createWallTextures = ({
  tiles: { textures: t },
}: LoadedSpritesheets): Record<Bit4MaskValue, PIXI.Texture[]> => ({
  0: [t.walls_2b, t.walls_3b],
  1: [t.walls_4b],
  2: [t.walls_2a, t.walls_2c, t.walls_3a, t.walls_3c, t.walls_4c],
  3: [t.walls_5c],
  4: [t.walls_1c],
  5: [t.walls_1c],
  6: [t.walls_2a, t.walls_2c, t.walls_3a, t.walls_3c, t.walls_4c],
  7: [t.walls_2a, t.walls_2c, t.walls_3a, t.walls_3c, t.walls_4c],
  8: [t.walls_1b, t.walls_5b],
  9: [t.walls_1b, t.walls_5b],
  10: [t.walls_5a],
  11: [t.walls_5a],
  12: [t.walls_1a],
  13: [t.walls_1a],
  14: [t.walls_4a],
  15: [t.walls_4a],
});

const createEdgeTextures = ({
  tiles: { textures: t },
}: LoadedSpritesheets): Record<Bit8MaskValue, PIXI.Texture[]> => ({
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [t.edge_5c],
  12: [],
  13: [],
  14: [],
  15: [],
  16: [],
  17: [],
  18: [],
  19: [],
  20: [],
  21: [],
  22: [t.edge_1c],
  23: [],
  24: [],
  25: [],
  26: [],
  27: [],
  28: [],
  29: [],
  30: [],
  31: [t.edge_4c],
  32: [],
  33: [],
  34: [],
  35: [],
  36: [],
  37: [],
  38: [],
  39: [],
  40: [],
  41: [],
  42: [],
  43: [],
  44: [],
  45: [],
  46: [],
  47: [],
  48: [],
  49: [],
  50: [],
  51: [],
  52: [],
  53: [],
  54: [],
  55: [],
  56: [],
  57: [],
  58: [],
  59: [],
  60: [],
  61: [],
  62: [],
  63: [t.edge_4c],
  64: [],
  65: [],
  66: [],
  67: [],
  68: [],
  69: [],
  70: [],
  71: [],
  72: [],
  73: [],
  74: [],
  75: [],
  76: [],
  77: [],
  78: [],
  79: [],
  80: [],
  81: [],
  82: [],
  83: [],
  84: [],
  85: [],
  86: [],
  87: [],
  88: [],
  89: [],
  90: [],
  91: [],
  92: [],
  93: [],
  94: [],
  95: [],
  96: [],
  97: [],
  98: [],
  99: [],
  100: [],
  101: [],
  102: [],
  103: [],
  104: [t.edge_5a],
  105: [],
  106: [],
  107: [t.edge_5b],
  108: [],
  109: [],
  110: [],
  111: [t.edge_5b],
  112: [],
  113: [],
  114: [],
  115: [],
  116: [],
  117: [],
  118: [],
  119: [],
  120: [],
  121: [],
  122: [],
  123: [],
  124: [],
  125: [],
  126: [],
  127: [t.edge_3c],
  128: [],
  129: [],
  130: [],
  131: [],
  132: [],
  133: [],
  134: [],
  135: [],
  136: [],
  137: [],
  138: [],
  139: [],
  140: [],
  141: [],
  142: [],
  143: [],
  144: [],
  145: [],
  146: [],
  147: [],
  148: [],
  149: [],
  150: [],
  151: [],
  152: [],
  153: [],
  154: [],
  155: [],
  156: [],
  157: [],
  158: [],
  159: [t.edge_4c],
  160: [],
  161: [],
  162: [],
  163: [],
  164: [],
  165: [],
  166: [],
  167: [],
  168: [],
  169: [],
  170: [],
  171: [],
  172: [],
  173: [],
  174: [],
  175: [],
  176: [],
  177: [],
  178: [],
  179: [],
  180: [],
  181: [],
  182: [],
  183: [],
  184: [],
  185: [],
  186: [],
  187: [],
  188: [],
  189: [],
  190: [],
  191: [t.edge_4c],
  192: [],
  193: [],
  194: [],
  195: [],
  196: [],
  197: [],
  198: [],
  199: [],
  200: [],
  201: [],
  202: [],
  203: [],
  204: [],
  205: [],
  206: [],
  207: [],
  208: [t.edge_1a],
  209: [],
  210: [],
  211: [],
  212: [],
  213: [],
  214: [t.edge_1b],
  215: [t.edge_1b],
  216: [],
  217: [],
  218: [],
  219: [t.edge_2c],
  220: [],
  221: [],
  222: [],
  223: [t.edge_2c],
  224: [],
  225: [],
  226: [],
  227: [],
  228: [],
  229: [],
  230: [],
  231: [],
  232: [],
  233: [],
  234: [],
  235: [t.edge_5b],
  236: [],
  237: [],
  238: [],
  239: [t.edge_5b],
  240: [],
  241: [],
  242: [],
  243: [],
  244: [],
  245: [],
  246: [t.edge_1b],
  247: [t.edge_1b],
  248: [t.edge_4a],
  249: [t.edge_4a],
  250: [],
  251: [t.edge_3a],
  252: [t.edge_4a],
  253: [t.edge_4a],
  254: [t.edge_2a],
  255: [],
});
