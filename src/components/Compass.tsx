import * as React from "react";
import { flooredModulo, angleBetweenPoints } from "../utils";
import { CompassPoint } from "./CompassPoint";
import type { Level } from "../Level";
import type { Player } from "../Player";
import styles from "./Compass.module.scss";

export type CompassRawPointType = {
  label: string;
  angle: number;
  align: "top" | "bottom";
  cap?: boolean;
};

type PropsType = Readonly<{
  player: Player;
  level: Level;
}>;

export function Compass({ player, level }: PropsType) {
  const [playerX, setPlayerX] = React.useState(player.x);
  const [playerY, setPlayerY] = React.useState(player.y);
  const [playerAngle, setPlayerAngle] = React.useState(player.angle);

  const nonEmptyRooms = React.useMemo(
    () => level.rooms.filter((room) => room.type !== "empty"),
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

    return () => {
      unsubscribeMove();
      unsubscribeTurn();
    };
  }, [player]);

  const points: CompassRawPointType[] = [
    { label: "N", angle: 0, align: "top" },
    { label: "S", angle: 180, align: "top" },
    { label: "E", angle: 90, align: "top" },
    { label: "W", angle: 270, align: "top" },
    ...nonEmptyRooms.map<CompassRawPointType>((room, i) => ({
      label: `${room.type}_${i}`,
      angle: angleBetweenPoints(playerX, playerY, room.x, room.y),
      align: "bottom",
      cap: true,
    })),
  ];

  return (
    <div className={styles.track}>
      {points.map((point) => (
        <CompassPoint
          key={point.label}
          label={point.label}
          value={getPointValue(playerAngle, point.angle)}
          align={point.align}
          cap={point.cap}
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
