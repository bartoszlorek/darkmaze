import * as React from "react";
import styles from "./Logger.module.scss";

export function Logger() {
  return <pre id="logger" className={styles.container} />;
}

let content = "";
export function logText(value: string) {
  content += value + "\n";
  const elem = document.querySelector("#logger")!;
  elem.textContent = content;
  elem.scrollTop = elem.scrollHeight;
}
