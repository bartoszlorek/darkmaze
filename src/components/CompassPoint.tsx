import * as React from "react";
import cx from "classnames";
import styles from "./CompassPoint.module.scss";

type PropsType = Readonly<{
  label: string;
  value: number;
  align: "top" | "bottom";
  cap?: boolean;
}>;

export function CompassPoint({ label, value, align, cap }: PropsType) {
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

  const textClass = cx(styles.text, {
    [styles.textAlignTop]: align === "top",
    [styles.textAlignBottom]: align === "bottom",
  });

  return (
    <div className={styles.point} style={{ left: `${actualValue * 100}%` }}>
      <span className={textClass}>{label}</span>
    </div>
  );
}
