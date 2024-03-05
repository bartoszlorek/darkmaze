import * as PIXI from "pixi.js";
import { Direction8Angle } from "../helpers";
import { DrawFunction } from "./draw";
import type { LoadedSpritesheets } from "../assets";
import type { Player, PlayerStatus } from "../core";
import { FrameBounds } from "./FrameBounds";

export const drawPlayer: DrawFunction<{
  player: Player;
  frame: FrameBounds;
  sprites: LoadedSpritesheets;
}> = ({ parent, player, frame, sprites }) => {
  const anim = new PIXI.AnimatedSprite(sprites.player.animations.right_walk);
  anim.anchor.set(0.5);
  anim.animationSpeed = 0.1666;
  parent.addChild(anim);

  let lastFacingAngle: number;
  let lastPlayerStatus: PlayerStatus;
  return () => {
    anim.x = frame.centerX;
    anim.y = frame.centerY;

    if (
      lastFacingAngle !== player.facingAngle ||
      lastPlayerStatus !== player.status
    ) {
      switch (player.facingAngle) {
        case Direction8Angle.upLeft:
          anim.textures = sprites.player.animations.upLeft_walk;
          break;

        case Direction8Angle.up:
          anim.textures = sprites.player.animations.up_walk;
          break;

        case Direction8Angle.upRight:
          anim.textures = sprites.player.animations.upRight_walk;
          break;

        case Direction8Angle.left:
          anim.textures = sprites.player.animations.left_walk;
          break;

        case Direction8Angle.right:
          anim.textures = sprites.player.animations.right_walk;
          break;

        case Direction8Angle.downLeft:
          anim.textures = sprites.player.animations.downLeft_walk;
          break;

        case Direction8Angle.down:
          anim.textures = sprites.player.animations.down_walk;
          break;

        case Direction8Angle.downRight:
          anim.textures = sprites.player.animations.downRight_walk;
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
