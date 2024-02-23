import { TILE_SIZE } from "./consts";

export type MarginObject = Readonly<{
  top: number;
  left: number;
  right: number;
  bottom: number;
}>;

const mobileMargin: MarginObject = {
  top: TILE_SIZE * 0.75,
  left: TILE_SIZE * 0.25,
  right: TILE_SIZE * 0.25,
  bottom: TILE_SIZE * 0.75,
};

const desktopMargin: MarginObject = {
  top: TILE_SIZE,
  left: TILE_SIZE,
  right: TILE_SIZE,
  bottom: TILE_SIZE,
};

export function getMargin() {
  return window.innerWidth < 800 ? mobileMargin : desktopMargin;
}
