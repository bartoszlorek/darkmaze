import * as React from "react";
import styles from "./Controls.module.scss";

type PropsType = Readonly<{
  type: "mobile" | "desktop";
  label: string;
}>;

export function Controls({ type, label }: PropsType) {
  const filename = type === "mobile" ? "controls_mobile" : "controls_desktop";

  return (
    <div className={styles.wrapper}>
      <img src={`./assets/${filename}.png`} width={100} height={100} />
      <div className={styles.label}>{label}</div>
    </div>
  );
}
