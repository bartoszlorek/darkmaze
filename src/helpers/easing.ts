// based on https://gist.github.com/gre/1650294
// https://andrewraycode.github.io/easing-utils/gh-pages/

/**
 * accelerating from zero velocity
 * @param t number [0..1]
 */
export function easeInQuad(t: number) {
  return t * t;
}

/**
 * decelerating to zero velocity
 * @param t number [0..1]
 */
export function easeOutQuad(t: number) {
  return t * (2 - t);
}

/**
 * acceleration until halfway, then deceleration
 * @param t number [0..1]
 */
export function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * accelerating from zero velocity
 * @param t number [0..1]
 */
export function easeInCubic(t: number) {
  return t * t * t;
}

/**
 * decelerating to zero velocity
 * @param t number [0..1]
 */
export function easeOutCubic(t: number) {
  return --t * t * t + 1;
}

/**
 * acceleration until halfway, then deceleration
 * @param t number [0..1]
 */
export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

/**
 * accelerating from zero velocity
 * @param t number [0..1]
 */
export function easeInQuart(t: number) {
  return t * t * t * t;
}

/**
 * decelerating to zero velocity
 * @param t number [0..1]
 */
export function easeOutQuart(t: number) {
  return 1 - --t * t * t * t;
}

/**
 * acceleration until halfway, then deceleration
 * @param t number [0..1]
 */
export function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
}

/**
 * accelerating from zero velocity
 * @param t number [0..1]
 */
export function easeInQuint(t: number) {
  return t * t * t * t * t;
}

/**
 * decelerating to zero velocity
 * @param t number [0..1]
 */
export function easeOutQuint(t: number) {
  return 1 + --t * t * t * t * t;
}

/**
 * acceleration until halfway, then deceleration
 * @param t number [0..1]
 */
export function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
}
