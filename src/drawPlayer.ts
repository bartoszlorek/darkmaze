import * as PIXI from "pixi.js";
import { DrawFunction, FacingAngle } from "./helpers";
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
      switch (player.status) {
        case "running":
        case "turning":
          switch (player.facingAngle) {
            case FacingAngle.upLeft:
              anim.textures = sprites.player.animations.upLeft;
              break;

            case FacingAngle.up:
              anim.textures = sprites.player.animations.up;
              break;

            case FacingAngle.upRight:
              anim.textures = sprites.player.animations.upRight;
              break;

            case FacingAngle.left:
              anim.textures = sprites.player.animations.left;
              break;

            case FacingAngle.right:
              anim.textures = sprites.player.animations.right;
              break;

            case FacingAngle.downLeft:
              anim.textures = sprites.player.animations.downLeft;
              break;

            case FacingAngle.down:
              anim.textures = sprites.player.animations.down;
              break;

            case FacingAngle.downRight:
              anim.textures = sprites.player.animations.downRight;
              break;
          }

          if (player.status === "running") {
            anim.gotoAndPlay(0);
          }
          break;

        default:
          anim.gotoAndStop(0);
          break;
      }
    }

    lastFacingAngle = player.facingAngle;
    lastPlayerStatus = player.status;
  };
};
