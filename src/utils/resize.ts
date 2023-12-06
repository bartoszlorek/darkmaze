export function subscribeResize(callback: () => void) {
  const handler = () => requestAnimationFrame(callback);
  window.addEventListener("resize", handler);

  return () => {
    window.removeEventListener("resize", handler);
  };
}
