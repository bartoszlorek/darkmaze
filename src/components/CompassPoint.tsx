import * as React from "react";
import styles from "./CompassPoint.module.scss";

type PropsType = Readonly<{
  value: string;
  position: number; // [0 .. 1]
}>;

export const CompassPoint = ({ value, position }: PropsType) => {
  if (position < 0 || position > 1) {
    return null;
  }
  return (
    <div className={styles.point} style={{ left: `${position * 100}%` }}>
      <span className={styles.text}>{value}</span>
    </div>
  );
};
