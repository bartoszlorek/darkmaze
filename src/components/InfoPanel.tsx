import * as React from "react";
import styles from "./InfoPanel.module.scss";

type PropsType = Readonly<{
  children: React.ReactNode;
}>;

export function InfoPanel({ children }: PropsType) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
