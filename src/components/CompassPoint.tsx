import * as React from "react";
import styles from "./CompassPoint.module.scss";

type PropsType = Readonly<{
  label: string;
  value: number;
  cap?: boolean;
}>;

export function CompassPoint({ label, value, cap }: PropsType) {
  let actualValue = value;
  if (actualValue < 0) {
    if (cap) {
      actualValue = 0;
    } else {
      return null;
    }
  } else if (actualValue > 1) {
    if (cap) {
      actualValue = 1;
    } else {
      return null;
    }
  }

  return (
    <div className={styles.point} style={{ left: `${actualValue * 100}%` }}>
      <span className={styles.text}>{label}</span>
    </div>
  );
}
