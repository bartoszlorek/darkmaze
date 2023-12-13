import * as React from "react";
import { flooredModulo } from "../utils";
import { CompassPoint } from "./CompassPoint";
import type { Player } from "../Player";
import styles from "./Compass.module.scss";

type PropsType = Readonly<{
  player: Player;
}>;

export function Compass({ player }: PropsType) {
  const [angle, setAngle] = React.useState(player.angle / 360);

  React.useEffect(() => {
    const unsubscribe = player.subscribe("turn", (payload) => {
      const pixelizedAngle = Math.round(payload.angle / 5) * 5;
      setAngle(pixelizedAngle / 360);
    });

    return () => {
      unsubscribe();
    };
  }, [player]);

  const north = flooredModulo(0.5 - angle, 1) * 2 - 0.5;
  const south = flooredModulo(1 - angle, 1) * 2 - 0.5;
  const east = flooredModulo(0.75 - angle, 1) * 2 - 0.5;
  const west = flooredModulo(0.25 - angle, 1) * 2 - 0.5;

  return (
    <div className={styles.track}>
      <CompassPoint value="N" position={north} />
      <CompassPoint value="S" position={south} />
      <CompassPoint value="E" position={east} />
      <CompassPoint value="W" position={west} />
    </div>
  );
}
