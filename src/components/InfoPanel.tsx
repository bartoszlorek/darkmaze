import * as React from "react";
import { MarginObject } from "../margin";
import { FrameBounds } from "../rendering";
import { subscribeResize } from "../helpers";
import styles from "./InfoPanel.module.scss";

type PropsType = Readonly<{
  tileSize: number;
  children: React.ReactNode;
  getMargin: () => MarginObject;
}>;

export function InfoPanel({ tileSize, children, getMargin }: PropsType) {
  const [frame, setFrame] = React.useState(() => {
    return new FrameBounds(tileSize, getMargin());
  });

  React.useEffect(() => {
    return subscribeResize(() => {
      setFrame(new FrameBounds(tileSize, getMargin()));
    });
  }, [tileSize, getMargin]);

  const style = React.useMemo(
    () => ({
      height: frame.actualMarginBottom + frame.tileSize / 2,
    }),
    [frame]
  );

  return (
    <div className={styles.wrapper} style={style}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
