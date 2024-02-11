import { Level, Player } from "../core";
import { Direction4Angle, createPointInView } from "../helpers";
import { Light } from "./LightsFilter";

const getPointInView = createPointInView(180);
const BACKGROUND_OUT_DELAY = 1000;

export function createLights(level: Level, player: Player) {
  const f1 = new Light();
  const f2 = new Light();
  const f3 = new Light();
  const f4 = new Light();

  const b1 = new Light();
  const b2 = new Light();
  const b3 = new Light();
  const b4 = new Light();

  const updatePositions = (angle: number) => {
    const width = window.innerWidth;
    f1.x = b1.x = getPointInView(angle, Direction4Angle.up) * width;
    f2.x = b2.x = getPointInView(angle, Direction4Angle.right) * width;
    f3.x = b3.x = getPointInView(angle, Direction4Angle.down) * width;
    f4.x = b4.x = getPointInView(angle, Direction4Angle.left) * width;
  };

  player.subscribe("turn", ({ angle }) => updatePositions(angle));
  updatePositions(player.angle);

  level.subscribe("room_enter", ({ room }) => {
    if (room.walls.up) {
      f1.setIntensity(0);
      b1.setIntensity(0, BACKGROUND_OUT_DELAY);
    } else {
      f1.setIntensity(1);
      b1.setIntensity(1);
    }

    if (room.walls.right) {
      f2.setIntensity(0);
      b2.setIntensity(0, BACKGROUND_OUT_DELAY);
    } else {
      f2.setIntensity(1);
      b2.setIntensity(1);
    }

    if (room.walls.down) {
      f3.setIntensity(0);
      b3.setIntensity(0, BACKGROUND_OUT_DELAY);
    } else {
      f3.setIntensity(1);
      b3.setIntensity(1);
    }

    if (room.walls.left) {
      f4.setIntensity(0);
      b4.setIntensity(0, BACKGROUND_OUT_DELAY);
    } else {
      f4.setIntensity(1);
      b4.setIntensity(1);
    }
  });

  const output = {
    frame: [f1, f2, f3, f4],
    background: [b1, b2, b3, b4],
  };

  return (deltaTime: number) => {
    const room = level.lastVisitedRoom;
    if (!room) {
      return output;
    }

    f1.radius =
      f2.radius =
      f3.radius =
      f4.radius =
      b1.radius =
      b2.radius =
      b3.radius =
      b4.radius =
        window.innerWidth / 2;

    f1.update(deltaTime);
    f2.update(deltaTime);
    f3.update(deltaTime);
    f4.update(deltaTime);
    b1.update(deltaTime);
    b2.update(deltaTime);
    b3.update(deltaTime);
    b4.update(deltaTime);
    return output;
  };
}
