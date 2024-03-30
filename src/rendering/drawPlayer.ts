import * as PIXI from "pixi.js";
import { Direction8Angle, createAnimationFrames } from "../helpers";
import { DrawFunction, noop } from "./draw";
import type { LoadedAssets } from "../assets";
import type { Player, PlayerStatus } from "../core";
import { FrameBounds } from "./FrameBounds";

export const drawPlayer: DrawFunction<{
  player: Player;
  frame: FrameBounds;
  assets: LoadedAssets;
}> = ({ parent, player, frame, assets }) => {
  const animations = createAnimationFrames(assets.player);
  const sprite = new PIXI.AnimatedSprite(animations.right_walk);
  sprite.anchor.set(0.5);
  parent.addChild(sprite);

  let lastFacingAngle: number;
  let lastPlayerStatus: PlayerStatus;

  return [
    () => {
      sprite.x = frame.centerX;
      sprite.y = frame.centerY;

      if (
        lastFacingAngle !== player.facingAngle ||
        lastPlayerStatus !== player.status
      ) {
        switch (player.facingAngle) {
          case Direction8Angle.upLeft:
            if (player.status === "running") {
              sprite.textures = animations.upLeft_walk;
            } else {
              sprite.textures = animations.upLeft_idle;
            }
            break;

          case Direction8Angle.up:
            if (player.status === "running") {
              sprite.textures = animations.up_walk;
            } else {
              sprite.textures = animations.up_idle;
            }
            break;

          case Direction8Angle.upRight:
            if (player.status === "running") {
              sprite.textures = animations.upRight_walk;
            } else {
              sprite.textures = animations.upRight_idle;
            }
            break;

          case Direction8Angle.left:
            if (player.status === "running") {
              sprite.textures = animations.left_walk;
            } else {
              sprite.textures = animations.left_idle;
            }
            break;

          case Direction8Angle.right:
            if (player.status === "running") {
              sprite.textures = animations.right_walk;
            } else {
              sprite.textures = animations.right_idle;
            }
            break;

          case Direction8Angle.downLeft:
            if (player.status === "running") {
              sprite.textures = animations.downLeft_walk;
            } else {
              sprite.textures = animations.downLeft_idle;
            }
            break;

          case Direction8Angle.down:
            if (player.status === "running") {
              sprite.textures = animations.down_walk;
            } else {
              sprite.textures = animations.down_idle;
            }
            break;

          case Direction8Angle.downRight:
            if (player.status === "running") {
              sprite.textures = animations.downRight_walk;
            } else {
              sprite.textures = animations.downRight_idle;
            }
            break;
        }

        if (player.status === "running" || player.status === "idle") {
          sprite.gotoAndPlay(0);
        }
      }

      lastFacingAngle = player.facingAngle;
      lastPlayerStatus = player.status;
    },
    noop,
  ];
};
