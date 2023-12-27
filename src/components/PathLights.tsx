import * as React from "react";
import { angleFromDirectionIndex, getPointInView } from "../helpers";
import { WallState } from "../core";
import type { Level, Player } from "../core";
import styles from "./PathLights.module.scss";

type PropsType = Readonly<{
  player: Player;
  level: Level;
}>;

export function PathLights({ player, level }: PropsType) {
  const [roomAngles, setRoomAngles] = React.useState<number[]>([]);
  const [playerAngle, setPlayerAngle] = React.useState(player.angle);

  React.useEffect(() => {
    const unsubscribeEnter = level.subscribe("room_enter", (payload) => {
      const angles: number[] = [];

      payload.room.walls.forEach((wall, index) => {
        if (wall === WallState.open) {
          angles.push(angleFromDirectionIndex(index));
        }
      });

      setRoomAngles(angles);
    });

    const unsubscribeTurn = player.subscribe("turn", (payload) => {
      setPlayerAngle(payload.angle);
    });

    return () => {
      unsubscribeEnter();
      unsubscribeTurn();
    };
  }, [player, level]);

  const linesLength = 31;
  const lines = buildLinesArray(
    roomAngles.map((roomAngle) => getPointInView(playerAngle, roomAngle, 180)),
    linesLength
  );

  return (
    <div className={styles.container}>
      {lines.map((opacity, index) => (
        <div key={index} className={styles.line} style={{ opacity }} />
      ))}
    </div>
  );
}

function buildLinesArray(points: number[], length: number) {
  const lines = Array.from({ length }, () => 0);
  const blurLength = Math.floor(length / 3);

  for (const point of points) {
    const index = Math.floor(point * length);
    if (index >= 0 && index < length) {
      lines[index] += 1;
    }

    for (let j = 1; j <= blurLength; j++) {
      const prev = index - j;
      if (prev >= 0 && prev < length) {
        lines[prev] += 1 - j / blurLength;
      }

      const next = index + j;
      if (next >= 0 && next < length) {
        lines[next] += 1 - j / blurLength;
      }
    }
  }

  return lines;
}
