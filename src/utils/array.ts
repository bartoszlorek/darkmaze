import { utils } from "pixi.js";

export function arrayRemove<T>(array: T[], item: T) {
  const index = array.indexOf(item);

  if (index !== -1) {
    utils.removeItems(array, index, 1);
  }
}

export function arrayRandomItem<T>(
  array: T[],
  rand: number = Math.random()
): T | undefined {
  return array[Math.floor(rand * array.length)];
}
