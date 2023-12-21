import * as PIXI from "pixi.js";

export const definedAssets = [
  {
    alias: "player",
    src: "./assets/player.png",
  },
] as const;

export type LoadedTextures = Record<
  (typeof definedAssets)[number]["alias"],
  PIXI.Texture
>;
