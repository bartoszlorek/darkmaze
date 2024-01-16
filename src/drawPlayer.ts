import * as PIXI from "pixi.js";
import { DrawFunction, Direction8Angle } from "./helpers";
import type { LoadedSpritesheets } from "./assets";
import type { Player, PlayerStatus } from "./core";

export const drawPlayer: DrawFunction<{
  player: Player;
  gridSize: number;
  sprites: LoadedSpritesheets;
}> = ({ parent, player, gridSize, sprites }) => {
  const anim = new PIXI.AnimatedSprite(sprites.player.animations.right);
  anim.anchor.set(0.5);
  anim.animationSpeed = 0.1666;
  parent.addChild(anim);

  let lastFacingAngle: number;
  let lastPlayerStatus: PlayerStatus;
  return () => {
    anim.x = player.x * gridSize + gridSize / 2;
    anim.y = player.y * gridSize + gridSize / 2;

    if (
      lastFacingAngle !== player.facingAngle ||
      lastPlayerStatus !== player.status
    ) {
      switch (player.facingAngle) {
        case Direction8Angle.upLeft:
          anim.textures = sprites.player.animations.upLeft;
          break;

        case Direction8Angle.up:
          anim.textures = sprites.player.animations.up;
          break;

        case Direction8Angle.upRight:
          anim.textures = sprites.player.animations.upRight;
          break;

        case Direction8Angle.left:
          anim.textures = sprites.player.animations.left;
          break;

        case Direction8Angle.right:
          anim.textures = sprites.player.animations.right;
          break;

        case Direction8Angle.downLeft:
          anim.textures = sprites.player.animations.downLeft;
          break;

        case Direction8Angle.down:
          anim.textures = sprites.player.animations.down;
          break;

        case Direction8Angle.downRight:
          anim.textures = sprites.player.animations.downRight;
          break;
      }

      if (player.status === "running") {
        anim.gotoAndPlay(0);
      }
    }

    lastFacingAngle = player.facingAngle;
    lastPlayerStatus = player.status;
  };
};
