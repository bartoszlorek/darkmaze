import * as React from "react";
import styles from "./Version.module.scss";

type PropsType = Readonly<{
  children: React.ReactNode;
}>;

export function Version({ children }: PropsType) {
  return <div className={styles.version}>{children}</div>;
}
