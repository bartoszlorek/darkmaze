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

export const directionAngles: DirectionAngle[] = [0, 90, 180, 270];

/**
 * Returns the angle of the direction index.
 */
export function indexToAngle(index: DirectionIndex): DirectionAngle {
  return directionAngles[index];
}

/**
 * Returns the direction index of the angle.
 */
export function angleToIndex(angle: number): DirectionIndex {
  return Math.floor(normalizeAngle(angle + 45) / 90);
}

/**
 * The definition of floored division modulo.
 * https://en.wikipedia.org/wiki/Modulo
 */
export function flooredModulo(a: number, n: number) {
  return a - Math.floor(a / n) * n;
}

/**
 * Returns the angle between two angles.
 */
export function subtractAngle(a: number, b: number) {
  return flooredModulo(a - b + 180, 360) - 180;
}

/**
 * Returns the angle between 0 and 360 degrees.
 */
export function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

/**
 * Linear interpolation between two angles.
 */
export function lerpAngle(a: number, b: number, bias: number) {
  const diff = subtractAngle(a, b);

  if (Math.abs(diff) >= 0.5) {
    return lerp(a, a - diff, bias);
  }
  return b;
}

/**
 * Linear interpolation between two values.
 */
export function lerp(a: number, b: number, bias: number) {
  return a * (1 - bias) + b * bias;
}

/**
 * Returns the angle between two points.
 */
export function angleBetweenPoints(
  originX: number,
  originY: number,
  pointX: number,
  pointY: number
) {
  const deltaX = pointX - originX;
  const deltaY = pointY - originY;
  return (Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90;
}
