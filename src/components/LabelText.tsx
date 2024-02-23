import * as React from "react";
import cx from "classnames";
import styles from "./LabelText.module.scss";

type PropsType = Readonly<{
  label: string;
  children: React.ReactNode;
  desktopOnly?: boolean;
}>;

export function LabelText({ label, children, desktopOnly }: PropsType) {
  const wrapperClass = cx(styles.wrapper, {
    [styles.wrapperDesktopOnly]: desktopOnly,
  });

  return (
    <label className={wrapperClass}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}
