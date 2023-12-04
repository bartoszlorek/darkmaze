import { utils } from "pixi.js";

export function arrayRemove<T>(array: Array<T>, item: T) {
  const index = array.indexOf(item);

  if (index !== -1) {
    utils.removeItems(array, index, 1);
  }
}
