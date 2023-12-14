import * as React from "react";
import styles from "./CompassPoint.module.scss";

type PropsType = Readonly<{
  label: string;
  value: number;
}>;

export function CompassPoint({ label, value }: PropsType) {
  if (value < 0 || value > 1) {
    return null;
  }

  return (
    <div className={styles.point} style={{ left: `${value * 100}%` }}>
      <span className={styles.text}>{label}</span>
    </div>
  );
}
