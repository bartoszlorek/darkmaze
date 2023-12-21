import * as PIXI from "pixi.js";
import type { DrawFunction } from "./helpers";
import type { Player } from "./core";

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
    sprite.angle = player.facingAngle;
  };
};
