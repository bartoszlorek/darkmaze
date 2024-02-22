import * as React from "react";
import type { Timer } from "../core";

type PropsType = Readonly<{
  timer: Timer;
}>;

export function TimeCounter({ timer }: PropsType) {
  const [time, setTime] = React.useState(() => {
    return timer.toTime();
  });

  React.useEffect(() => {
    timer.subscribe("tick", (a) => {
      setTime(a.toTime());
    });

    timer.subscribe("finish", (a) => {
      setTime(a.toPreciseTime());
    });

    return () => {
      timer.destroy();
    };
  }, [timer]);

  return <span>{time}</span>;
}
