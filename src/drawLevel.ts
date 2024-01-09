import * as PIXI from "pixi.js";
import { DEBUG_MODE } from "./debug";
import { LoadedSpritesheets } from "./assets";
import { DrawFunction, TilesOutline, Pool } from "./helpers";
import { createDebugger } from "./debugger";
import type { Level, Room } from "./core";

type RoomPartialSprites = Readonly<{
  floor: PIXI.Sprite;
  outer: PIXI.Container;
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
      outer: new PIXI.Container(),
      walls: new PIXI.Sprite(),
      items: new PIXI.Sprite(),
    };

    refs.set(room, partials);
    root.addChild(partials.floor);
    root.addChild(partials.outer);
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

  const g = new PIXI.Graphics();
  parent.addChild(g);

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
      }

      const { walls, items } = refs.get(room) as RoomPartialSprites;
      if (room.explored) {
        walls.texture = textures[`room_${room.signature}`];

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
      }
    }

    g.clear();
    g.lineStyle(2, 0xfff);
    for (const cycle of outline.edges) {
      for (const edge of cycle) {
        g.moveTo(edge.a[0], edge.a[1]);
        g.lineTo(edge.b[0], edge.b[1]);

        const spriteA = outlineSprites.get(edge + "a");
        const spriteB = outlineSprites.get(edge + "b");

        if (edge.vector[1] === 0) {
          if (edge.vector[0] > 0) {
            spriteA.texture = textures.room_outer_0a;
            spriteA.x = edge.a[0];
            spriteA.y = edge.a[1] - outlineSize;

            spriteB.texture = textures.room_outer_0b;
            spriteB.x = edge.a[0] + outlineSize;
            spriteB.y = edge.a[1] - outlineSize;
          } else {
            spriteA.texture = textures.room_outer_4a;
            spriteA.x = edge.b[0] + outlineSize;
            spriteA.y = edge.b[1];

            spriteB.texture = textures.room_outer_4b;
            spriteB.x = edge.b[0];
            spriteB.y = edge.b[1];
          }
        } else {
          if (edge.vector[1] > 0) {
            spriteA.texture = textures.room_outer_2a;
            spriteA.x = edge.a[0];
            spriteA.y = edge.a[1];

            spriteB.texture = textures.room_outer_2b;
            spriteB.x = edge.a[0];
            spriteB.y = edge.a[1] + outlineSize;
          } else {
            spriteA.texture = textures.room_outer_6a;
            spriteA.x = edge.b[0] - outlineSize;
            spriteA.y = edge.b[1] + outlineSize;

            spriteB.texture = textures.room_outer_6b;
            spriteB.x = edge.b[0] - outlineSize;
            spriteB.y = edge.b[1];
          }
        }
      }
    }

    outlineSprites.afterAll();
    debug.afterAll();
  };
};
