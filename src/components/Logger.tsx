import * as React from "react";
import type { Player } from "../Player";
import styles from "./Logger.module.scss";

type PropsType = Readonly<{
  player: Player;
}>;

export function Logger({ player }: PropsType) {
  const [diffAngle, setDiffAngle] = React.useState(0);
  const [diffFactor, setDiffFactor] = React.useState(0);

  React.useEffect(() => {
    const unsubscribePath = player.subscribe("path", (value) => {
      setDiffAngle(value.diffAngle);
      setDiffFactor(value.diffFactor);
    });

    return () => {
      unsubscribePath();
    };
  }, [player]);

  const value = formatOutput(`
  player_angle: ${player.angle}
  player_x: ${player.x}
  player_y: ${player.y}
  player_move_dir: ${player.moveDirection}
  player_turn_dir: ${player.turnDirection}

  path_diff_angle: ${diffAngle}
  path_diff_factor: ${diffFactor}`);

  return <pre className={styles.container}>{value}</pre>;
}

function formatOutput(value: string) {
  return value.replace(/\n\u0020+/gm, "\n").trim();
}
