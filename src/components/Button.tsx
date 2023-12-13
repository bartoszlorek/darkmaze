import * as React from "react";
import styles from "./Button.module.scss";

type PropsType = Readonly<{
  children: React.ReactNode;
  onClick: () => void;
}>;

export function Button({ children, onClick }: PropsType) {
  return (
    <div className={styles.button} onClick={onClick}>
      {children}
    </div>
  );
}
