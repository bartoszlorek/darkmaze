import * as PIXI from "pixi.js";
import { LoadedSpritesheets } from "./assets";
import { WallState, Level, Room } from "./core";
import { DEBUG_MODE } from "./debug";
import { createDebugger } from "./debugger";
import {
  DirectionIndex,
  DrawFunction,
  Edge,
  Pool,
  Tile,
  TilesOutline,
  modIndex,
} from "./helpers";

type RoomPartialSprites = Readonly<{
  floor: PIXI.Sprite;
  walls: PIXI.Sprite;
  items: PIXI.Sprite;
}>;

export const drawLevel: DrawFunction<
  {
    level: Level;
    gridSize: number;
    sprites: LoadedSpritesheets;
    debugMode: DEBUG_MODE;
  },
  [revealed: boolean]
> = ({ parent, level, gridSize, sprites, debugMode }) => {
  const { textures } = sprites.world;
  const roomsLayer = new PIXI.Container();
  const debug = createDebugger();

  parent.addChild(roomsLayer);
  parent.addChild(debug.layer);

  const refs = new Map<Room, RoomPartialSprites>();
  for (const room of level.rooms) {
    const root = new PIXI.Container();
    root.x = room.x * gridSize;
    root.y = room.y * gridSize;
    roomsLayer.addChild(root);

    // fills the root with partial sprites
    const partials: RoomPartialSprites = {
      floor: new PIXI.Sprite(),
      walls: new PIXI.Sprite(),
      items: new PIXI.Sprite(),
    };

    refs.set(room, partials);
    root.addChild(partials.floor);
    root.addChild(partials.walls);
    root.addChild(partials.items);
  }

  const outline = new TilesOutline();
  const outlineMask: boolean[][] = [];
  const outlineSize = gridSize / 2;
  const outlineSprites = new Pool(
    () => {
      const sprite = new PIXI.Sprite();
      roomsLayer.addChild(sprite);
      return sprite;
    },
    (sprite) => {
      sprite.destroy();
    }
  );

  level.subscribe("room_explore", ({ room }) => {
    outline.addTile(room.x, room.y, gridSize);
    outline.parse();

    const exitEdges: Edge[] = [];
    for (const room of level.rooms) {
      if (!room.explored && room.exploredConnectedRooms > 0) {
        const exitTile = new Tile(room.x, room.y, gridSize);

        if (room.walls[DirectionIndex.up] === WallState.open) {
          exitEdges.push(exitTile.up);
        }
        if (room.walls[DirectionIndex.right] === WallState.open) {
          exitEdges.push(exitTile.right);
        }
        if (room.walls[DirectionIndex.down] === WallState.open) {
          exitEdges.push(exitTile.down);
        }
        if (room.walls[DirectionIndex.left] === WallState.open) {
          exitEdges.push(exitTile.left);
        }
      }
    }

    for (let i = 0; i < outline.edges.length; i++) {
      if (!outlineMask[i]) {
        outlineMask[i] = [];
      }
      for (let j = 0; j < outline.edges[i].length; j++) {
        outlineMask[i][j] = !exitEdges.some((other) =>
          outline.edges[i][j].isEqual(other)
        );
      }
    }
  });

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

      const { walls, floor, items } = refs.get(room) as RoomPartialSprites;
      if (room.explored || debugMode === DEBUG_MODE.ROOMS_LAYOUT) {
        walls.texture = textures[`room_${room.signature}`];
        floor.texture =
          room.randomId % 2 === 0
            ? textures.room_floor_1
            : textures.room_floor_2;

        switch (room.type) {
          case "evil":
            items.texture = textures.room_evil;
            break;

          case "golden":
            items.texture = textures.room_golden;
            break;

          case "passage":
            items.texture = textures.room_passage;
            break;
        }
      } else if (room.exploredConnectedRooms > 0) {
        floor.texture = textures.room_floor_2;
      }
    }

    for (let i = 0; i < outline.edges.length; i++) {
      const cycleLength = outline.edges[i].length;

      for (let j = 0; j < cycleLength; j++) {
        const edge = outline.edges[i][j];

        if (!outlineMask[i][j]) {
          debug.print(
            "x",
            (edge.a.x + edge.b.x) / 2,
            (edge.a.y + edge.b.y) / 2
          );
          continue;
        }

        const prevEdgeIndex = modIndex(j - 1, cycleLength);
        const nextEdgeIndex = modIndex(j + 1, cycleLength);
        const prevEdgeVisible = outlineMask[i][prevEdgeIndex];
        const nextEdgeVisible = outlineMask[i][nextEdgeIndex];

        if (edge.vector.y === 0) {
          /**
           * going right
           */
          if (edge.vector.x > 0) {
            const a = outlineSprites.get(edge + "a");
            a.texture =
              edge.a.type === "concave" && prevEdgeVisible
                ? textures.room_inner_2
                : textures.room_outer_0a;
            a.x = edge.a.x;
            a.y = edge.a.y - outlineSize;

            if (edge.b.type !== "concave" || !nextEdgeVisible) {
              const b = outlineSprites.get(edge + "b");
              b.texture = textures.room_outer_0b;
              b.x = edge.a.x + outlineSize;
              b.y = edge.a.y - outlineSize;

              if (edge.b.type === "convex") {
                const c = outlineSprites.get(edge + "c");
                c.texture = textures.room_outer_1;
                c.x = edge.b.x;
                c.y = edge.b.y - outlineSize;
              }
            }

            /**
             * going left
             */
          } else {
            const a = outlineSprites.get(edge + "a");
            a.texture =
              edge.a.type === "concave" && prevEdgeVisible
                ? textures.room_inner_0
                : textures.room_outer_4a;
            a.x = edge.b.x + outlineSize;
            a.y = edge.b.y;

            if (edge.b.type !== "concave" || !nextEdgeVisible) {
              const b = outlineSprites.get(edge + "b");
              b.texture = textures.room_outer_4b;
              b.x = edge.b.x;
              b.y = edge.b.y;

              if (edge.b.type === "convex") {
                const c = outlineSprites.get(edge + "c");
                c.texture = textures.room_outer_5;
                c.x = edge.b.x - outlineSize;
                c.y = edge.b.y;
              }
            }
          }
        } else {
          /**
           * going down
           */
          if (edge.vector.y > 0) {
            const a = outlineSprites.get(edge + "a");
            a.texture =
              edge.a.type === "concave" && prevEdgeVisible
                ? textures.room_inner_3
                : textures.room_outer_2a;
            a.x = edge.a.x;
            a.y = edge.a.y;

            if (edge.b.type !== "concave" || !nextEdgeVisible) {
              const b = outlineSprites.get(edge + "b");
              b.texture = textures.room_outer_2b;
              b.x = edge.a.x;
              b.y = edge.a.y + outlineSize;

              if (edge.b.type === "convex") {
                const c = outlineSprites.get(edge + "c");
                c.texture = textures.room_outer_3;
                c.x = edge.b.x;
                c.y = edge.b.y;
              }
            }

            /**
             * going up
             */
          } else {
            const a = outlineSprites.get(edge + "a");
            a.texture =
              edge.a.type === "concave" && prevEdgeVisible
                ? textures.room_inner_1
                : textures.room_outer_6a;
            a.x = edge.b.x - outlineSize;
            a.y = edge.b.y + outlineSize;

            if (edge.b.type !== "concave" || !nextEdgeVisible) {
              const b = outlineSprites.get(edge + "b");
              b.texture = textures.room_outer_6b;
              b.x = edge.b.x - outlineSize;
              b.y = edge.b.y;

              if (edge.b.type === "convex") {
                const c = outlineSprites.get(edge + "c");
                c.texture = textures.room_outer_7;
                c.x = edge.b.x - outlineSize;
                c.y = edge.b.y - outlineSize;
              }
            }
          }
        }
      }
    }

    outlineSprites.afterAll();
    debug.afterAll();
  };
};
