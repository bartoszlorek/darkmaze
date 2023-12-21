import * as PIXI from "pixi.js";
import playerData from "./player.json";

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

export type LoadedSpritesheets = Readonly<{
  player: PIXI.Spritesheet<typeof playerData>;
}>;

export async function loadSpritesheets(): Promise<LoadedSpritesheets> {
  const textures = await PIXI.Assets.load<PIXI.Texture>([
    {
      alias: "player",
      src: "./assets/player.png",
    },
  ]);

  const player = new PIXI.Spritesheet(textures.player, playerData);
  await player.parse();

  return {
    player,
  };
}
