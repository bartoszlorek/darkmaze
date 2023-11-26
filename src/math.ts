export enum DirectionIndex {
  up = 0,
  right = 1,
  down = 2,
  left = 3,
}

export enum DirectionAngle {
  up = 0,
  right = 90,
  down = 180,
  left = 270,
}

/**
 * The direction index of the angle.
 */
export function angleDirectionIndex(angle: number): DirectionIndex {
  return Math.floor(normalizeAngle(angle + 45) / 90);
}

/**
 * The definition of floored division modulo.
 * https://en.wikipedia.org/wiki/Modulo
 */
export function modulo(a: number, n: number) {
  return a - Math.floor(a / n) * n;
}

/**
 * The angle between two angles.
 */
export function differenceAngle(a: number, b: number) {
  return modulo(a - b + 180, 360) - 180;
}

/**
 * The angle between 0 and 360 degrees.
 */
export function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

/**
 * Linear interpolation between two values.
 */
export function lerp(a: number, b: number, bias: number) {
  return a * (1 - bias) + b * bias;
}

/**
 * Linear interpolation between two angles.
 */
export function lerpAngle(a: number, b: number, bias: number) {
  return a - differenceAngle(a, b) * bias;
}
