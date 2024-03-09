import * as React from "react";
import cx from "classnames";
import styles from "./Button.module.scss";

type PropsType = Readonly<{
  children: React.ReactNode;
  onClick: () => void;
  locked?: boolean;
}>;

export function Button({ children, onClick, locked }: PropsType) {
  const buttonClass = cx(styles.button, {
    [styles.locked]: locked,
  });

  return (
    <div className={buttonClass} onClick={locked ? undefined : onClick}>
      {children}
      {locked && <div className={styles.lock}></div>}
    </div>
  );
}
