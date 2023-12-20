import * as React from "react";
import styles from "./MenuScreen.module.scss";

type PropsType = Readonly<{
  children: React.ReactNode;
}>;

export function MenuScreen({ children }: PropsType) {
  return <div className={styles.container}>{children}</div>;
}
