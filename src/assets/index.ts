import * as PIXI from "pixi.js";
import playerData from "./player.json";
import worldData from "./world.json";

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

export type LoadedSpritesheets = Readonly<{
  player: PIXI.Spritesheet<typeof playerData>;
  world: PIXI.Spritesheet<typeof worldData>;
}>;

export async function loadSpritesheets(): Promise<LoadedSpritesheets> {
  const textures = await PIXI.Assets.load<PIXI.Texture>([
    {
      alias: "player",
      src: "./assets/player.png",
    },
    {
      alias: "world",
      src: "./assets/world.png",
    },
  ]);

  const player = new PIXI.Spritesheet(textures.player, playerData);
  await player.parse();

  const world = new PIXI.Spritesheet(textures.world, worldData);
  await world.parse();

  return {
    player,
    world,
  };
}
