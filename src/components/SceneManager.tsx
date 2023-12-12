import * as React from "react";
import styles from "./SceneManager.module.scss";

type PropsType = Readonly<{
  resetKey: number | string;
  sceneIndex: number;
  scenes: React.ReactNode[];
}>;

export function SceneManager({ resetKey, sceneIndex, scenes }: PropsType) {
  return (
    <div key={resetKey}>
      {scenes[sceneIndex]}
      <div key={sceneIndex} className={styles.curtain} />
    </div>
  );
}
