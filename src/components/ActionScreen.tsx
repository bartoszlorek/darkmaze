import * as React from "react";
import cx from "classnames";
import { MenuScreen } from "./MenuScreen";
import styles from "./ActionScreen.module.scss";

type PropsType = Readonly<{
  title: string;
  titleColor?: "red" | "yellow" | "white";
  children: React.ReactNode;
}>;

export function ActionScreen({
  title,
  titleColor = "white",
  children,
}: PropsType) {
  const titleClass = cx(styles.title, {
    [styles.titleColorRed]: titleColor === "red",
    [styles.titleColorYellow]: titleColor === "yellow",
    [styles.titleColorWhite]: titleColor === "white",
  });

  return (
    <MenuScreen>
      <h1 className={titleClass}>{title}</h1>
      {children}
    </MenuScreen>
  );
}
