import * as React from "react";
import styles from "./LabelText.module.scss";

type PropsType = Readonly<{
  label: string;
  children: React.ReactNode;
}>;

export function LabelText({ label, children }: PropsType) {
  return (
    <label className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <span className={styles.content}>{children}</span>
    </label>
  );
}
