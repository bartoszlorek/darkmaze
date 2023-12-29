import * as PIXI from "pixi.js";
import { DEBUG_MODE } from "./debug";
import { LoadedSpritesheets } from "./assets";
import type { DrawFunction } from "./helpers";
import type { Level, Room } from "./core";

const textStyleOptions = {
  fontFamily: "Arial",
  fontSize: 16,
  fill: 0xffffff,
  align: "center",
} as const;

export const drawLevel: DrawFunction<
  {
    level: Level;
    gridSize: number;
    sprites: LoadedSpritesheets;
    debug: DEBUG_MODE;
  },
  [revealed: boolean]
> = ({ parent, level, gridSize, sprites, debug }) => {
  const roomsLayer = new PIXI.Container();
  const debugLayer = new PIXI.Container();
  parent.addChild(roomsLayer);
  parent.addChild(debugLayer);

  const debugTexts: PIXI.Text[] = [];
  if (debug === DEBUG_MODE.VISITED_CONNECTED) {
    for (const room of level.rooms) {
      const debugText = new PIXI.Text(0, textStyleOptions);
      debugText.x = room.x * gridSize + gridSize / 2;
      debugText.y = room.y * gridSize + gridSize / 2;
      debugTexts.push(debugText);
      debugLayer.addChild(debugText);
    }
  }

  const renderers: RoomRenderer[] = [];
  for (const room of level.rooms) {
    const renderer = new RoomRenderer(room);
    renderer.x = room.x * gridSize;
    renderer.y = room.y * gridSize;
    renderers.push(renderer);
    roomsLayer.addChild(renderer);
  }

  return (revealed) => {
    for (let i = 0; i < level.rooms.length; i++) {
      const room = level.rooms[i];

      if (debug === DEBUG_MODE.VISITED_CONNECTED) {
        debugTexts[i].text = room.visitedConnectedRooms;
      }

      renderers[i].renderRoom(
        sprites,
        revealed || debug === DEBUG_MODE.ROOMS_LAYOUT
      );
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
