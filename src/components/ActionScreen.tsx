import * as React from "react";
import cx from "classnames";
import styles from "./ActionScreen.module.scss";

type PropsType = Readonly<{
  title: string;
  titleColor?: "red" | "yellow" | "white";
  actions: React.ReactNode;
}>;

export function ActionScreen({
  title,
  titleColor = "white",
  actions,
}: PropsType) {
  const titleClass = cx(styles.title, {
    [styles.titleColorRed]: titleColor === "red",
    [styles.titleColorYellow]: titleColor === "yellow",
    [styles.titleColorWhite]: titleColor === "white",
  });

  return (
    <div className={styles.container}>
      <h1 className={titleClass}>{title}</h1>
      {actions}
    </div>
  );
}
