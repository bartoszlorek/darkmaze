export function throttle<A extends unknown[], R = void>(
  fn: (...args: A) => R,
  delay: number
): [(...args: A) => R | void, () => void] {
  let wait = false;
  let timeoutId: number;
  let cancelled = false;

  return [
    (...args: A) => {
      if (wait || cancelled) {
        return;
      }

      wait = true;
      timeoutId = window.setTimeout(() => {
        wait = false;
      }, delay);

      return fn(...args);
    },
    () => {
      cancelled = true;
      clearTimeout(timeoutId);
    },
  ];
}
