import * as PIXI from "pixi.js";
import { facingAngleFromAngle } from "./utils";
import type { DrawFunction } from "./utils";
import type { Player } from "./Player";

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
    sprite.angle = facingAngleFromAngle(player.angle);
  };
};
