import * as PIXI from "pixi.js";
import { DEBUG_MODE } from "./debug";
import { LoadedSpritesheets } from "./assets";
import { DrawFunction, ScalarField } from "./helpers";
import { createDebugger } from "./debugger";
import type { Level, Room } from "./core";

export const drawLevel: DrawFunction<
  {
    level: Level;
    gridSize: number;
    sprites: LoadedSpritesheets;
    debug: DEBUG_MODE;
  },
  [revealed: boolean]
> = ({ parent, level, gridSize, sprites, debug }) => {
  const [debugLayer, print] = createDebugger();
  const roomsLayer = new PIXI.Container();
  const outerLayer = new PIXI.Container();

  parent.addChild(outerLayer);
  parent.addChild(roomsLayer);
  parent.addChild(debugLayer);

  const outerMargin = 1;
  const outerSize = gridSize / 2;
  const outerWidth = level.dimension * 2 + outerMargin * 2;
  const outerField = new ScalarField(outerWidth, outerWidth);
  const outerSprites: PIXI.Sprite[] = [];

  outerField.forEachValue((_, x, y) => {
    const outer = new PIXI.Sprite();
    outer.x = x * outerSize - outerSize;
    outer.y = y * outerSize - outerSize;
    outer.visible = false;
    outerSprites.push(outer);
    outerLayer.addChild(outer);
  });

  const renderers: RoomRenderer[] = [];
  for (const room of level.rooms) {
    const renderer = new RoomRenderer(room);
    renderer.x = room.x * gridSize;
    renderer.y = room.y * gridSize;
    renderers.push(renderer);
    roomsLayer.addChild(renderer);
  }

  level.subscribe("room_explore", ({ room }) => {
    const x = room.x * 2 + outerMargin;
    const y = room.y * 2 + outerMargin;
    outerField.setValue(x, y, 1);
    outerField.setValue(x + 1, y, 1);
    outerField.setValue(x, y + 1, 1);
    outerField.setValue(x + 1, y + 1, 1);
    outerField.parseVectors();
  });

  return (revealed) => {
    for (let i = 0; i < level.rooms.length; i++) {
      const room = level.rooms[i];

      if (debug === DEBUG_MODE.VISITED_CONNECTED) {
        print(
          room.visitedConnectedRooms,
          room.x * gridSize + gridSize / 2,
          room.y * gridSize + gridSize / 2
        );
      }

      renderers[i].renderRoom(
        sprites,
        revealed || debug === DEBUG_MODE.ROOMS_LAYOUT
      );
    }

    for (let i = 0; i < outerField.values.length; i++) {
      const value = outerField.values[i];
      const vector = outerField.vectors[i];

      if (value === 1 || (!vector[0] && !vector[1])) {
        outerSprites[i].visible = false;
        continue;
      }

      outerSprites[i].visible = true;
      if (vector[0] && vector[1]) {
        const inner = Math.abs(vector[0]) === 1;

        if (vector[1] < 0) {
          if (vector[0] < 0) {
            outerSprites[i].texture = inner
              ? sprites.world.textures.room_inner_1
              : sprites.world.textures.room_outer_7;
          } else {
            outerSprites[i].texture = inner
              ? sprites.world.textures.room_inner_2
              : sprites.world.textures.room_outer_1;
          }
        } else {
          if (vector[0] < 0) {
            outerSprites[i].texture = inner
              ? sprites.world.textures.room_inner_0
              : sprites.world.textures.room_outer_5;
          } else {
            outerSprites[i].texture = inner
              ? sprites.world.textures.room_inner_3
              : sprites.world.textures.room_outer_3;
          }
        }
      } else {
        if (vector[1] < 0) {
          outerSprites[i].texture = sprites.world.textures.room_outer_0;
        } else if (vector[1] > 0) {
          outerSprites[i].texture = sprites.world.textures.room_outer_4;
        } else if (vector[0] < 0) {
          outerSprites[i].texture = sprites.world.textures.room_outer_6;
        } else if (vector[0] > 0) {
          outerSprites[i].texture = sprites.world.textures.room_outer_2;
        }
      }
    }

    if (debug === DEBUG_MODE.OUTER) {
      outerField.forEachValue((_, x, y, i) => {
        const vector = outerField.vectors[i];
        const factor = outerField.values[i] ? 0 : 1;

        print(
          `${vector[0] * factor},${vector[1] * factor}`,
          x * outerSize - outerSize,
          y * outerSize - outerSize,
          10
        );
      });
    }
  };
};

class RoomRenderer extends PIXI.Sprite {
  protected room: Room;
  protected state: "initial" | "visited" | "explored" = "initial";

  constructor(room: Room) {
    super();
    this.room = room;
    this.visible = false;
  }

  renderRoom(sprites: LoadedSpritesheets, renderAll: boolean) {
    const { textures } = sprites.world;

    if (this.room.explored || renderAll) {
      if (this.state !== "explored") {
        this.state = "explored";
        this.texture = textures[`room_${this.room.signature}`];
        this.visible = true;

        this.removeChildren();
        switch (this.room.type) {
          case "evil":
            this.addChild(new PIXI.Sprite(textures.room_evil));
            break;

          case "golden":
            this.addChild(new PIXI.Sprite(textures.room_golden));
            break;

          case "passage":
            this.addChild(new PIXI.Sprite(textures.room_passage));
            break;
        }
      }
    } else if (this.room.visited) {
      if (this.state !== "visited") {
        this.state = "visited";
        this.visible = true;

        if (this.room.visitedDirection !== null) {
          this.texture = textures[`room_visited_${this.room.visitedDirection}`];
        } else {
          this.texture = textures.room_visited;
        }
      }
    }
  }
}
