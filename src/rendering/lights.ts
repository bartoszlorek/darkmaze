import { Level, Player } from "../core";
import { Direction4Angle, createPointInView } from "../helpers";
import { Light } from "./LightsFilter";

const getPointInView = createPointInView(180);

const delayedOptions = {
  changeUpDelay: 0,
  changeDownDelay: 800,
};

export function createLights(level: Level, player: Player) {
  // prettier-ignore
  const normal = [
    new Light(),
    new Light(),
    new Light(),
    new Light()
  ];

  const delayed = [
    new Light(delayedOptions),
    new Light(delayedOptions),
    new Light(delayedOptions),
    new Light(delayedOptions),
  ];

  const output = {
    normal,
    delayed,
  };

  level.subscribe("room_enter", ({ room }) => {
    normal[0].intensity = delayed[0].intensity =
      room.correctPathAngle === Direction4Angle.up ? 1 : 0;

    normal[1].intensity = delayed[1].intensity =
      room.correctPathAngle === Direction4Angle.left ? 1 : 0;

    normal[2].intensity = delayed[2].intensity =
      room.correctPathAngle === Direction4Angle.right ? 1 : 0;

    normal[3].intensity = delayed[3].intensity =
      room.correctPathAngle === Direction4Angle.down ? 1 : 0;
  });

  const updatePositions = () => {
    const angle = player.angle;
    const width = window.innerWidth;

    normal[0].x = delayed[0].x =
      getPointInView(angle, Direction4Angle.up) * width;

    normal[1].x = delayed[1].x =
      getPointInView(angle, Direction4Angle.left) * width;

    normal[2].x = delayed[2].x =
      getPointInView(angle, Direction4Angle.right) * width;

    normal[3].x = delayed[3].x =
      getPointInView(angle, Direction4Angle.down) * width;
  };

  player.subscribe("turn", updatePositions);
  updatePositions();

  return (deltaTime: number) => {
    const radius = window.innerWidth / 2;

    normal[0].radius = radius;
    normal[1].radius = radius;
    normal[2].radius = radius;
    normal[3].radius = radius;

    normal[0].update(deltaTime);
    normal[1].update(deltaTime);
    normal[2].update(deltaTime);
    normal[3].update(deltaTime);

    delayed[0].radius = radius;
    delayed[1].radius = radius;
    delayed[2].radius = radius;
    delayed[3].radius = radius;

    delayed[0].update(deltaTime);
    delayed[1].update(deltaTime);
    delayed[2].update(deltaTime);
    delayed[3].update(deltaTime);

    return output;
  };
}
