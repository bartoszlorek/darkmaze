/**
 * https://css-tricks.com/debouncing-throttling-explained-examples/#aa-leading-edge-or-immediate
 * https://gist.github.com/smoholkar/7022557c5045236f0eec93aad4d820f0
 */
export function debounce<A extends unknown[], R = void>(
  fn: (...args: A) => R,
  delay: number
): [(...args: A) => R | void, () => void] {
  let timeoutId: null | number;
  let cancelled = false;

  return [
    (...args: A) => {
      let called = false;

      // the leading edge
      if (timeoutId === null && !cancelled) {
        fn(...args);
        called = true;
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        if (!called && !cancelled) {
          fn(...args);
        }
        timeoutId = null;
      }, delay);
    },
    () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      cancelled = true;
    },
  ];
}
