import * as PIXI from "pixi.js";
import type { Player } from "../Player";
import type { DrawFunction } from "./draw";

export const drawPlayer: DrawFunction<{
  player: Player;
  gridSize: number;
}> = ({ parent, player, gridSize }) => {
  const sprite = PIXI.Sprite.from("https://pixijs.com/assets/bunny.png");

  sprite.anchor.set(0.5);
  parent.addChild(sprite);

  return () => {
    sprite.x = player.x * gridSize + gridSize / 2;
    sprite.y = player.y * gridSize + gridSize / 2;
    sprite.angle = Math.round(player.angle / 10) * 10;
  };
};
