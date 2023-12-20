import * as React from "react";
import { flooredModulo, angleBetweenPoints, floorNumber } from "../utils";
import { CompassDirectionPoint } from "./CompassDirectionPoint";
import { CompassEvilPoint } from "./CompassEvilPoint";
import { CompassGoldenPoint } from "./CompassGoldenPoint";
import { isEvil } from "../Room";
import type { Level } from "../Level";
import type { Player } from "../Player";
import type { Room } from "../Room";
import styles from "./Compass.module.scss";

const COMPASS_STEP_DEGREES = 10;
const FIELD_OF_VIEW = 200;
const FIELD_OF_VIEW_SCALE = 360 / FIELD_OF_VIEW;
const FIELD_OF_VIEW_OFFSET = (360 - FIELD_OF_VIEW) / 2;

const directionsPoints = [
  { label: "N", angle: 0 },
  { label: "S", angle: 180 },
  { label: "E", angle: 90 },
  { label: "W", angle: 270 },
];

type PropsType = Readonly<{
  player: Player;
  level: Level;
}>;

export function Compass({ player, level }: PropsType) {
  const [playerX, setPlayerX] = React.useState(player.x);
  const [playerY, setPlayerY] = React.useState(player.y);
  const [playerAngle, setPlayerAngle] = React.useState(player.angle);

  /**
   * a dynamic list of rooms
   */
  const [nearbyEvilRooms, setNearbyEvilRooms] = React.useState<Room[]>([]);

  /**
   * a static list of rooms
   */
  const goldenRooms = React.useMemo<Room[]>(
    () => level.rooms.filter((room) => room.type === "golden"),
    [level]
  );

  React.useEffect(() => {
    const unsubscribeMove = player.subscribe("move", (payload) => {
      setPlayerX(payload.x);
      setPlayerY(payload.y);
    });

    const unsubscribeTurn = player.subscribe("turn", (payload) => {
      setPlayerAngle(payload.angle);
    });

    const unsubscribeRoomEnter = level.subscribe("room_enter", ({ room }) => {
      setNearbyEvilRooms(level.filterAdjacentConnectedRooms(room, isEvil));
    });

    return () => {
      unsubscribeMove();
      unsubscribeTurn();
      unsubscribeRoomEnter();
    };
  }, [player, level]);

  return (
    <div className={styles.track}>
      {directionsPoints.map((point) => (
        <CompassDirectionPoint
          key={point.label}
          label={point.label}
          value={getPointInViewValue(playerAngle, point.angle)}
        />
      ))}
      {goldenRooms.map((room, i) => (
        <CompassGoldenPoint
          key={i}
          value={getPointInViewValue(
            playerAngle,
            angleBetweenPoints(playerX, playerY, room.x, room.y)
          )}
        />
      ))}
      {nearbyEvilRooms.map((room, i) => (
        <CompassEvilPoint
          key={i}
          value={getPointInViewValue(
            playerAngle,
            angleBetweenPoints(playerX, playerY, room.x, room.y)
          )}
        />
      ))}
    </div>
  );
}

function getPointInViewValue(playerAngle: number, pointAngle: number) {
  const circular = flooredModulo(pointAngle - playerAngle + 180, 360);
  const stepped = floorNumber(circular, COMPASS_STEP_DEGREES);
  return ((stepped - FIELD_OF_VIEW_OFFSET) * FIELD_OF_VIEW_SCALE) / 360;
}
