import * as PIXI from "pixi.js";
import type { LevelData } from "./createLevel";
import type { Player } from "./Player";

const GRID_SIZE = 64;
const GRID_HALF = GRID_SIZE / 2;

type PropsType = Readonly<{
  player: Player;
  level: LevelData;
}>;

export function createLevelRenderer({ player, level }: PropsType) {
  const roomsLayer = new PIXI.Graphics();
  roomsLayer.lineStyle(4, "#5f5854");

  const playerLayer = PIXI.Sprite.from("https://pixijs.com/assets/bunny.png");
  playerLayer.anchor.set(0.5);

  const container = new PIXI.Container();
  container.x = GRID_SIZE;
  container.y = GRID_SIZE;
  container.addChild(roomsLayer);
  container.addChild(playerLayer);

  level.rooms.forEach((room) => {
    const left = room.x * GRID_SIZE;
    const top = room.y * GRID_SIZE;
    const right = left + GRID_SIZE;
    const bottom = top + GRID_SIZE;

    if (room.walls[0]) {
      roomsLayer.moveTo(left, top);
      roomsLayer.lineTo(right, top);
    }

    if (room.walls[1]) {
      roomsLayer.moveTo(right, top);
      roomsLayer.lineTo(right, bottom);
    }

    if (room.walls[2]) {
      roomsLayer.moveTo(left, bottom);
      roomsLayer.lineTo(right, bottom);
    }

    if (room.walls[3]) {
      roomsLayer.moveTo(left, bottom);
      roomsLayer.lineTo(left, top);
    }
  });

  const update = () => {
    playerLayer.x = player.x * GRID_SIZE + GRID_HALF;
    playerLayer.y = player.y * GRID_SIZE + GRID_HALF;
    playerLayer.angle = player.angle;
  };

  return {
    container,
    update,
  };
}
