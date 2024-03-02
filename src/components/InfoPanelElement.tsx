import * as React from "react";
import cx from "classnames";
import styles from "./InfoPanelElement.module.scss";

type PropsType = Readonly<{
  children: React.ReactNode;
  visible?: "always" | "mobile" | "desktop";
  onClick?: () => void;
}>;

export function InfoPanelElement({
  children,
  visible = "always",
  onClick,
}: PropsType) {
  const elementClass = cx(styles.element, {
    [styles.elementMobileOnly]: visible === "mobile",
    [styles.elementDesktopOnly]: visible === "desktop",
    [styles.elementClickable]: onClick !== undefined,
  });

  return (
    <div className={elementClass}>
      <div className={styles.content} onClick={onClick} data-tappable>
        {children}
      </div>
    </div>
  );
}
