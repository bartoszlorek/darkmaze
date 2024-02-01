import { Level, Player } from "./core";
import { Direction4Angle, createPointInView, lerp } from "./helpers";

const getPointInView = createPointInView({ fieldOfView: 180 });

export class Light {
  public x: number = 0;
  public intensity: number = 0; // [0..1]
  public intensitySpeed: number = 0.025;

  setPosition(x: number) {
    this.x = x;
    return this;
  }

  setIntensity(value: number) {
    this.intensity = lerp(this.intensity, value, this.intensitySpeed);
    return this;
  }
}

export function createLights(level: Level, player: Player) {
  // prettier-ignore
  const output = [
    new Light(),
    new Light(),
    new Light(),
    new Light(),
  ] as const;

  return () => {
    const room = level.lastVisitedRoom;
    if (!room) {
      return output;
    }

    const angle = player.angle;
    const width = window.innerWidth;

    output[0]
      .setPosition(getPointInView(angle, Direction4Angle.up) * width)
      .setIntensity(room.walls.up ? 0 : 1);

    output[1]
      .setPosition(getPointInView(angle, Direction4Angle.left) * width)
      .setIntensity(room.walls.left ? 0 : 1);

    output[2]
      .setPosition(getPointInView(angle, Direction4Angle.right) * width)
      .setIntensity(room.walls.right ? 0 : 1);

    output[3]
      .setPosition(getPointInView(angle, Direction4Angle.down) * width)
      .setIntensity(room.walls.down ? 0 : 1);

    return output;
  };
}
