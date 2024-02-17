import { Level, Player, Room } from "../core";
import { Direction4Angle, createPointInView } from "../helpers";
import { Light } from "./LightsFilter";

enum LightIndex {
  up,
  left,
  right,
  down,
}

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
    normal[LightIndex.up].intensity = delayed[LightIndex.up].intensity =
      room.correctPathAngle === Direction4Angle.up ? 1 : 0;

    normal[LightIndex.left].intensity = delayed[LightIndex.left].intensity =
      room.correctPathAngle === Direction4Angle.left ? 1 : 0;

    normal[LightIndex.right].intensity = delayed[LightIndex.right].intensity =
      room.correctPathAngle === Direction4Angle.right ? 1 : 0;

    normal[LightIndex.down].intensity = delayed[LightIndex.down].intensity =
      room.correctPathAngle === Direction4Angle.down ? 1 : 0;

    const nearbyEvilRooms = level.getConnectedRooms(room).filter(Room.isEvil);
    for (const evilRoom of nearbyEvilRooms) {
      switch (true) {
        case room.y > evilRoom.y:
          normal[LightIndex.up].intensity = 1;
          delayed[LightIndex.up].intensity = 1;
          break;

        case room.y < evilRoom.y:
          normal[LightIndex.down].intensity = 1;
          delayed[LightIndex.down].intensity = 1;
          break;

        case room.x > evilRoom.x:
          normal[LightIndex.left].intensity = 1;
          delayed[LightIndex.left].intensity = 1;
          break;

        default:
          normal[LightIndex.right].intensity = 1;
          delayed[LightIndex.right].intensity = 1;
      }
    }
  });

  const updatePositions = () => {
    const angle = player.angle;
    const width = window.innerWidth;

    normal[LightIndex.up].x = delayed[LightIndex.up].x =
      getPointInView(angle, Direction4Angle.up) * width;

    normal[LightIndex.left].x = delayed[LightIndex.left].x =
      getPointInView(angle, Direction4Angle.left) * width;

    normal[LightIndex.right].x = delayed[LightIndex.right].x =
      getPointInView(angle, Direction4Angle.right) * width;

    normal[LightIndex.down].x = delayed[LightIndex.down].x =
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
