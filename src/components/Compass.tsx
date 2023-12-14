import * as React from "react";
import { flooredModulo, angleBetweenPoints } from "../utils";
import { CompassEvilPoint } from "./CompassEvilPoint";
import { CompassGoldenPoint } from "./CompassGoldenPoint";
import { CompassPoint } from "./CompassPoint";
import type { Level } from "../Level";
import type { Player } from "../Player";
import type { Room } from "../Room";
import styles from "./Compass.module.scss";

type CompassRawPointType = {
  label: string;
  angle: number;
};

const labeledPoints: CompassRawPointType[] = [
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

  const goldenRooms = React.useMemo(
    () => level.rooms.filter((room) => room.type === "golden"),
    [level]
  );

  const [nearbyEvilRooms, setNearbyEvilRooms] = React.useState<Room[]>([]);

  React.useEffect(() => {
    const unsubscribeMove = player.subscribe("move", (payload) => {
      setPlayerX(payload.x);
      setPlayerY(payload.y);
    });

    const unsubscribeTurn = player.subscribe("turn", (payload) => {
      setPlayerAngle(payload.angle);
    });

    const unsubscribeRoomEnter = level.subscribe("room_enter", ({ room }) => {
      const foundNearbyEvilRooms = level
        .getAdjacentRooms(room)
        .reduce((acc, room) => {
          if (room?.type === "evil") {
            acc.push(room);
          }
          return acc;
        }, [] as Room[]);

      setNearbyEvilRooms(foundNearbyEvilRooms);
    });

    return () => {
      unsubscribeMove();
      unsubscribeTurn();
      unsubscribeRoomEnter();
    };
  }, [player, level]);

  return (
    <div className={styles.track}>
      {labeledPoints.map((point) => (
        <CompassPoint
          key={point.label}
          label={point.label}
          value={getPointValue(playerAngle, point.angle)}
        />
      ))}
      {goldenRooms.map((room, i) => (
        <CompassGoldenPoint
          key={i}
          value={getPointValue(
            playerAngle,
            angleBetweenPoints(playerX, playerY, room.x, room.y)
          )}
        />
      ))}
      {nearbyEvilRooms.map((room, i) => (
        <CompassEvilPoint
          key={i}
          value={getPointValue(
            playerAngle,
            angleBetweenPoints(playerX, playerY, room.x, room.y)
          )}
        />
      ))}
    </div>
  );
}

const FIELD_OF_VIEW = 200;
const FIELD_OF_VIEW_SCALE = 360 / FIELD_OF_VIEW;
const FIELD_OF_VIEW_OFFSET = (360 - FIELD_OF_VIEW) / 2;

function getPointValue(playerAngle: number, pointAngle: number) {
  const radial = flooredModulo(pointAngle - playerAngle + 180, 360);
  return ((radial - FIELD_OF_VIEW_OFFSET) * FIELD_OF_VIEW_SCALE) / 360;
}
