import * as PIXI from "pixi.js";
import { Direction8Angle } from "../helpers";
import { DrawFunction } from "./draw";
import type { LoadedSpritesheets } from "../assets";
import type { Player, PlayerStatus } from "../core";

export const drawPlayer: DrawFunction<{
  player: Player;
  tileSize: number;
  sprites: LoadedSpritesheets;
}> = ({ parent, player, tileSize, sprites }) => {
  const anim = new PIXI.AnimatedSprite(sprites.player.animations.right);
  anim.anchor.set(0.5);
  anim.animationSpeed = 0.1666;
  parent.addChild(anim);

  let lastFacingAngle: number;
  let lastPlayerStatus: PlayerStatus;
  return () => {
    anim.x = player.x * tileSize + tileSize / 2;
    anim.y = player.y * tileSize + tileSize / 2;

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
