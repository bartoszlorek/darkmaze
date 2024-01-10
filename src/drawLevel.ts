import * as PIXI from "pixi.js";
import { DEBUG_MODE } from "./debug";
import { LoadedSpritesheets } from "./assets";
import { DrawFunction, TilesOutline, Pool } from "./helpers";
import { createDebugger } from "./debugger";
import type { Level, Room } from "./core";

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

    for (const cycle of outline.edges) {
      for (const edge of cycle) {
        if (edge.vector.y === 0) {
          /**
           * going right
           */
          if (edge.vector.x > 0) {
            const a = outlineSprites.get(edge + "a");
            a.texture =
              edge.a.type === "concave"
                ? textures.room_inner_2
                : textures.room_outer_0a;
            a.x = edge.a.x;
            a.y = edge.a.y - outlineSize;

            if (edge.b.type !== "concave") {
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
              edge.a.type === "concave"
                ? textures.room_inner_0
                : textures.room_outer_4a;
            a.x = edge.b.x + outlineSize;
            a.y = edge.b.y;

            if (edge.b.type !== "concave") {
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
              edge.a.type === "concave"
                ? textures.room_inner_3
                : textures.room_outer_2a;
            a.x = edge.a.x;
            a.y = edge.a.y;

            if (edge.b.type !== "concave") {
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
              edge.a.type === "concave"
                ? textures.room_inner_1
                : textures.room_outer_6a;
            a.x = edge.b.x - outlineSize;
            a.y = edge.b.y + outlineSize;

            if (edge.b.type !== "concave") {
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
