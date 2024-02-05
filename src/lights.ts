import { Level, Player } from "./core";
import { Direction4Angle, createPointInView } from "./helpers";
import { Light } from "./LightsFilter";

const getPointInView = createPointInView({ fieldOfView: 180 });

export function createLights(level: Level, player: Player) {
  const up = new Light();
  const right = new Light();
  const down = new Light();
  const left = new Light();

  const output = [up, right, down, left];

  return () => {
    const room = level.lastVisitedRoom;
    if (!room) {
      return output;
    }

    const angle = player.angle;
    const width = window.innerWidth;

    up.setRadius(width / 2)
      .setPosition(getPointInView(angle, Direction4Angle.up) * width)
      .setIntensity(room.walls.up ? 0 : 1);

    right
      .setRadius(width / 2)
      .setPosition(getPointInView(angle, Direction4Angle.right) * width)
      .setIntensity(room.walls.right ? 0 : 1);

    down
      .setRadius(width / 2)
      .setPosition(getPointInView(angle, Direction4Angle.down) * width)
      .setIntensity(room.walls.down ? 0 : 1);

    left
      .setRadius(width / 2)
      .setPosition(getPointInView(angle, Direction4Angle.left) * width)
      .setIntensity(room.walls.left ? 0 : 1);

    return output;
  };
}
