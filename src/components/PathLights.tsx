import * as React from "react";
import type { Player } from "../Player";
import styles from "./PathLights.module.scss";

type PropsType = Readonly<{
  player: Player;
}>;

export function PathLights({ player }: PropsType) {
  const [diffFactor, setDiffFactor] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = player.subscribe("path", (value) => {
      setDiffFactor(value.diffFactor);
    });

    return () => {
      unsubscribe();
    };
  }, [player]);

  const opacityValue = Math.abs(diffFactor);
  const areEqual = opacityValue < 0.1 || opacityValue > 0.9;
  const leftMultiplier = areEqual ? 0 : diffFactor < 0 ? 1 : 0;
  const rightMultiplier = areEqual ? 0 : diffFactor > 0 ? 1 : 0;

  return (
    <>
      <div
        className={styles.left}
        style={{ opacity: opacityValue * leftMultiplier }}
      ></div>
      <div
        className={styles.right}
        style={{ opacity: opacityValue * rightMultiplier }}
      ></div>
    </>
  );
}
