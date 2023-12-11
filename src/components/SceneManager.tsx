import * as React from "react";
import styles from "./SceneManager.module.scss";

type PropsType = Readonly<{
  sceneIndex: number;
  scenes: React.ReactNode[];
}>;

export function SceneManager({ sceneIndex, scenes }: PropsType) {
  return (
    <div>
      {scenes[sceneIndex]}
      <div key={sceneIndex} className={styles.curtain} />
    </div>
  );
}
