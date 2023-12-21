import * as React from "react";
import { debounce } from "../helpers";
import type { Player, PlayerEvents } from "../core";
import styles from "./PathLights.module.scss";

const PATH_LIGHTS_DELAY = 250;

type PropsType = Readonly<{
  player: Player;
}>;

export function PathLights({ player }: PropsType) {
  const [opacityLeft, setOpacityLeft] = React.useState(0);
  const [opacityRight, setOpacityRight] = React.useState(0);

  React.useEffect(() => {
    const [handler, cancelHandler] = debounce<
      [payload: PlayerEvents["pathSense"]]
    >((payload) => {
      setOpacityLeft(payload.left);
      setOpacityRight(payload.right);
    }, PATH_LIGHTS_DELAY);

    const unsubscribe = player.subscribe("pathSense", handler);

    return () => {
      unsubscribe();
      cancelHandler();
    };
  }, [player]);

  return (
    <>
      <div className={styles.left} style={{ opacity: opacityLeft }}></div>
      <div className={styles.right} style={{ opacity: opacityRight }}></div>
    </>
  );
}
