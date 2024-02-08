import * as PIXI from "pixi.js";
import frameData from "./frame.json";
import playerData from "./player.json";
import itemsData from "./items.json";
import tilesData from "./tiles.json";

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

export type LoadedSpritesheets = Readonly<{
  frame: PIXI.Spritesheet<typeof frameData>;
  player: PIXI.Spritesheet<typeof playerData>;
  items: PIXI.Spritesheet<typeof itemsData>;
  tiles: PIXI.Spritesheet<typeof tilesData>;
}>;

export async function loadSpritesheets(): Promise<LoadedSpritesheets> {
  const textures = await PIXI.Assets.load<PIXI.Texture>([
    {
      alias: "frame",
      src: "./assets/frame.png",
    },
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

  const frame = new PIXI.Spritesheet(textures.frame, frameData);
  const player = new PIXI.Spritesheet(textures.player, playerData);
  const items = new PIXI.Spritesheet(textures.items, itemsData);
  const tiles = new PIXI.Spritesheet(textures.tiles, tilesData);

  await Promise.all([
    frame.parse(),
    player.parse(),
    items.parse(),
    tiles.parse(),
  ]);

  return {
    frame,
    player,
    items,
    tiles,
  };
}
