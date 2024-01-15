export type Bit = 0 | 1;

export type BitMaskValue =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15;

/**
 * @see https://code.tutsplus.com/how-to-use-tile-bitmasking-to-auto-tile-your-level-layouts--cms-25673t
 * @see https://www.samdriver.xyz/article/neighbour-aware-tiles
 */
export function createBitMask(b1: Bit, b2: Bit, b3: Bit, b4: Bit) {
  let value = 0;
  if (b1) value += 1;
  if (b2) value += 2;
  if (b3) value += 4;
  if (b4) value += 8;

  return value as BitMaskValue;
}
