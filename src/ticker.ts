export function createTicker(
  callback: (deltaTime: number) => void,
  fps: number = 60
) {
  const deltaTime = 1 / fps;
  let accumulatedTime = 0;

  return (deltaFrame: number) => {
    accumulatedTime += deltaTime * deltaFrame;

    while (accumulatedTime > deltaTime) {
      accumulatedTime -= deltaTime;
      callback(deltaTime);
    }
  };
}
