import * as React from "react";
import styles from "./CompassEvilPoint.module.scss";

type PropsType = Readonly<{
  value: number;
}>;

export function CompassEvilPoint({ value }: PropsType) {
  const clampedValue = value < 0 ? 0 : value > 1 ? 1 : value;

  return (
    <div
      className={styles.point}
      style={{ left: `${clampedValue * 100}%` }}
    ></div>
  );
}
