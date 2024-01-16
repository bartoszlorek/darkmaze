/**
 * Linear interpolation between two values.
 */
export function lerp(a: number, b: number, bias: number) {
  return a * (1 - bias) + b * bias;
}

export function ceilNumber(value: number, precision: number) {
  return Math.ceil(value / precision) * precision;
}

export function floorNumber(value: number, precision: number) {
  return Math.floor(value / precision) * precision;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function modIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

/**
 * The definition of floored division modulo.
 * https://en.wikipedia.org/wiki/Modulo
 */
export function flooredModulo(a: number, n: number) {
  return a - Math.floor(a / n) * n;
}

/**
 * Returns the angle between 0 and 360 degrees.
 */
export function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

export function subtractAngle(a: number, b: number) {
  return flooredModulo(a - b + 180, 360) - 180;
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
