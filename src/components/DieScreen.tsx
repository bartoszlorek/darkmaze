import * as React from "react";
import styles from "./DieScreen.module.scss";

type PropsType = Readonly<{
  onResetClick: () => void;
}>;

export function DieScreen({ onResetClick }: PropsType) {
  return (
    <div className={styles.container}>
      <h1 className={styles.headline}>YOU DIED</h1>
      <button onClick={onResetClick}>reset</button>
    </div>
  );
}
