import * as React from "react";
import styles from "./Input.module.scss";

type PropsType = Readonly<{
  value: string;
  onChange: (value: string) => void;
}>;

export function InputText({ value, onChange }: PropsType) {
  return (
    <input
      type="text"
      value={value}
      className={styles.inputText}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}
