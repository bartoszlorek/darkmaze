import { flooredModulo } from "./math";

export function getPointInView(
  originAngle: number,
  targetAngle: number,
  fieldOfView: number
) {
  const scale = 360 / fieldOfView;
  const offset = (360 - fieldOfView) / 2;
  const radial = flooredModulo(targetAngle - originAngle + 180, 360);
  return ((radial - offset) * scale) / 360;
}

export function createPointInView({ fieldOfView }: { fieldOfView: number }) {
  const scale = 360 / fieldOfView;
  const offset = (360 - fieldOfView) / 2;

  return (originAngle: number, targetAngle: number) => {
    const radial = flooredModulo(targetAngle - originAngle + 180, 360);
    return ((radial - offset) * scale) / 360;
  };
}
