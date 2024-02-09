import * as PIXI from "pixi.js";
import { Player, Level } from "../core";
import { LoadedSpritesheets } from "../assets";
import { Pool } from "../helpers";
import { DrawFunction } from "./draw";
import { FrameBounds } from "./FrameBounds";

export const drawCompass: DrawFunction<{
  player: Player;
  level: Level;
  frame: FrameBounds;
  tileSize: number;
  sprites: LoadedSpritesheets;
}> = ({ parent, player, level, frame, tileSize, sprites }) => {
  const refs = new Pool(
    () => parent.addChild(new PIXI.Sprite()),
    (sprite) => sprite.destroy()
  );

  let tilesCount = 0;
  let width = 0;
  let margin = 0;

  const updateTrack = () => {
    tilesCount = Math.floor(Math.min(500, frame.width * 0.6) / tileSize);
    width = tilesCount * tileSize;
    margin = Math.round((frame.width - width) / 2);

    const left = refs.get("left");
    left.texture = sprites.frame.textures["compass_left"];
    left.x = frame.left + margin;
    left.y = frame.top;

    const right = refs.get("right");
    right.texture = sprites.frame.textures["compass_right"];
    right.x = frame.left + margin + width - tileSize;
    right.y = frame.top;

    for (let i = 1; i < tilesCount - 1; i++) {
      const mid = refs.get(`mid_${i}`);
      mid.texture = sprites.frame.textures["compass_mid"];
      mid.x = frame.left + margin + i * tileSize;
      mid.y = frame.top;
    }

    refs.afterAll();
  };

  return updateTrack;
};
