import * as PIXI from "pixi.js";
import playerData from "./player.json";
import itemsData from "./items.json";
import tilesData from "./tiles.json";

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

export type LoadedSpritesheets = Readonly<{
  player: PIXI.Spritesheet<typeof playerData>;
  items: PIXI.Spritesheet<typeof itemsData>;
  tiles: PIXI.Spritesheet<typeof tilesData>;
}>;

export async function loadSpritesheets(): Promise<LoadedSpritesheets> {
  const textures = await PIXI.Assets.load<PIXI.Texture>([
    {
      alias: "player",
      src: "./assets/player.png",
    },
    {
      alias: "items",
      src: "./assets/items.png",
    },
    {
      alias: "tiles",
      src: "./assets/tiles.png",
    },
  ]);

  const player = new PIXI.Spritesheet(textures.player, playerData);
  const items = new PIXI.Spritesheet(textures.items, itemsData);
  const tiles = new PIXI.Spritesheet(textures.tiles, tilesData);

  await Promise.all([player.parse(), items.parse(), tiles.parse()]);

  return {
    player,
    items,
    tiles,
  };
}
