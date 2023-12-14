import * as React from "react";
import { flooredModulo } from "../utils";
import { CompassPoint } from "./CompassPoint";
import type { Player } from "../Player";
import styles from "./Compass.module.scss";

export type CompassRawPointType = {
  label: string;
  angle: number;
  cap?: boolean;
};

type PropsType = Readonly<{
  player: Player;
}>;

export function Compass({ player }: PropsType) {
  const [playerAngle, setPlayerAngle] = React.useState(player.angle);

  React.useEffect(() => {
    const unsubscribe = player.subscribe("turn", (payload) =>
      setPlayerAngle(payload.angle)
    );

    return () => {
      unsubscribe();
    };
  }, [player]);

  const points: CompassRawPointType[] = [
    { label: "N", angle: 0 },
    { label: "S", angle: 180 },
    { label: "E", angle: 90 },
    { label: "W", angle: 270 },
  ];

  return (
    <div className={styles.track}>
      {points.map((point) => (
        <CompassPoint
          key={point.label}
          label={point.label}
          value={getPointValue(playerAngle, point.angle)}
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
