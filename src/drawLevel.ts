import * as PIXI from "pixi.js";
import { DEBUG_MODE } from "./debug";
import { LoadedSpritesheets } from "./assets";
import { DrawFunction, TilesOutline } from "./helpers";
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
  const outerSize = gridSize / 2;

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

  const g = new PIXI.Graphics();
  parent.addChild(g);

  const outline = new TilesOutline();
  level.subscribe("room_explore", ({ room }) => {
    outline.addTile(room.x, room.y);
    outline.parse(gridSize);
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
      for (let i = 0; i < cycle.length; i++) {
        const edge = cycle[i];
        g.moveTo(edge.a[0], edge.a[1]);
        g.lineTo(edge.b[0], edge.b[1]);

        debug.print(
          i,
          (edge.a[0] + edge.b[0]) / 2,
          (edge.a[1] + edge.b[1]) / 2
        );
      }
    }

    debug.afterAll();
  };
};
