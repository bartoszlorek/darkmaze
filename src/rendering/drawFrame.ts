import * as PIXI from "pixi.js";
import { LoadedSpritesheets } from "../assets";
import { Pool } from "../helpers";
import { DrawFunction } from "./draw";
import { FrameBounds } from "./frame";

export const drawFrame: DrawFunction<
  {
    gridSize: number;
    sprites: LoadedSpritesheets;
  },
  [frame: FrameBounds]
> = ({ gridSize, parent, sprites }) => {
  const frameSprites = new Pool(
    () => parent.addChild(new PIXI.Sprite()),
    (sprite) => sprite.destroy()
  );

  return (frame) => {
    const topLeft = frameSprites.get("topLeft");
    topLeft.texture = sprites.frame.textures["frame_topLeft"];
    topLeft.x = frame.left;
    topLeft.y = frame.top;

    const topRight = frameSprites.get("topRight");
    topRight.texture = sprites.frame.textures["frame_topRight"];
    topRight.x = frame.right - gridSize;
    topRight.y = frame.top;

    const downLeft = frameSprites.get("downLeft");
    downLeft.texture = sprites.frame.textures["frame_downLeft"];
    downLeft.x = frame.left;
    downLeft.y = frame.bottom - gridSize;

    const downRight = frameSprites.get("downRight");
    downRight.texture = sprites.frame.textures["frame_downRight"];
    downRight.x = frame.right - gridSize;
    downRight.y = frame.bottom - gridSize;

    for (let i = 1; i < frame.tilesX - 1; i++) {
      const top = frameSprites.get(`top_${i}`);
      top.texture = sprites.frame.textures["frame_top"];
      top.x = frame.left + gridSize * i;
      top.y = frame.top;

      const down = frameSprites.get(`down_${i}`);
      down.texture = sprites.frame.textures["frame_down"];
      down.x = frame.left + gridSize * i;
      down.y = frame.bottom - gridSize;
    }

    for (let i = 1; i < frame.tilesY - 1; i++) {
      const left = frameSprites.get(`left_${i}`);
      left.texture = sprites.frame.textures["frame_left"];
      left.x = frame.left;
      left.y = frame.top + gridSize * i;

      const right = frameSprites.get(`right_${i}`);
      right.texture = sprites.frame.textures["frame_right"];
      right.x = frame.right - gridSize;
      right.y = frame.top + gridSize * i;
    }

    frameSprites.afterAll();
  };
};
