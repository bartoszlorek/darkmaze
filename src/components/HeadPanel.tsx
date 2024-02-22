import * as React from "react";
import styles from "./HeadPanel.module.scss";

type PropsType = Readonly<{
  children: React.ReactNode;
}>;

export function HeadPanel({ children }: PropsType) {
  return <div className={styles.container}>{children}</div>;
}
