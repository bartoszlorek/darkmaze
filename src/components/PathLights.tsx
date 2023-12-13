import * as React from "react";
import type { Player } from "../Player";
import styles from "./PathLights.module.scss";

type PropsType = Readonly<{
  player: Player;
}>;

export function PathLights({ player }: PropsType) {
  const [opacityLeft, setOpacityLeft] = React.useState(0);
  const [opacityRight, setOpacityRight] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = player.subscribe("pathSense", (payload) => {
      setOpacityLeft(payload.left);
      setOpacityRight(payload.right);
    });

    return () => {
      unsubscribe();
    };
  }, [player]);

  return (
    <>
      <div className={styles.left} style={{ opacity: opacityLeft }}></div>
      <div className={styles.right} style={{ opacity: opacityRight }}></div>
    </>
  );
}
