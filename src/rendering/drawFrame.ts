import * as PIXI from "pixi.js";
import { LoadedAssets } from "../assets";
import { Pool } from "../helpers";
import { DrawFunction } from "./draw";
import { FrameBounds } from "./FrameBounds";

export const drawFrame: DrawFunction<{
  frame: FrameBounds;
  tileSize: number;
  assets: LoadedAssets;
}> = ({ parent, frame, tileSize, assets }) => {
  const refs = new Pool(
    () => parent.addChild(new PIXI.Sprite()),
    (sprite) => sprite.destroy()
  );

  return () => {
    const topLeft = refs.get("topLeft");
    topLeft.texture = assets.tiles.textures["frame_topLeft"];
    topLeft.x = frame.left;
    topLeft.y = frame.top;

    const topRight = refs.get("topRight");
    topRight.texture = assets.tiles.textures["frame_topRight"];
    topRight.x = frame.right - tileSize;
    topRight.y = frame.top;

    const downLeft = refs.get("downLeft");
    downLeft.texture = assets.tiles.textures["frame_downLeft"];
    downLeft.x = frame.left;
    downLeft.y = frame.bottom - tileSize;

    const downRight = refs.get("downRight");
    downRight.texture = assets.tiles.textures["frame_downRight"];
    downRight.x = frame.right - tileSize;
    downRight.y = frame.bottom - tileSize;

    for (let i = 1; i < frame.tilesCountX - 1; i++) {
      const top = refs.get(`top_${i}`);
      top.texture = assets.tiles.textures["frame_top"];
      top.x = frame.left + tileSize * i;
      top.y = frame.top;

      const down = refs.get(`down_${i}`);
      down.texture = assets.tiles.textures["frame_down"];
      down.x = frame.left + tileSize * i;
      down.y = frame.bottom - tileSize;
    }

    for (let i = 1; i < frame.tilesCountY - 1; i++) {
      const left = refs.get(`left_${i}`);
      left.texture = assets.tiles.textures["frame_left"];
      left.x = frame.left;
      left.y = frame.top + tileSize * i;

      const right = refs.get(`right_${i}`);
      right.texture = assets.tiles.textures["frame_right"];
      right.x = frame.right - tileSize;
      right.y = frame.top + tileSize * i;
    }

    refs.afterAll();
  };
};
