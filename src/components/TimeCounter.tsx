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
    const unsubscribeTick = timer.subscribe("tick", (a) => {
      setTime(a.toTime());
    });

    const unsubscribeStop = timer.subscribe("stop", (a) => {
      setTime(a.toPreciseTime());
    });

    return () => {
      unsubscribeTick();
      unsubscribeStop();
    };
  }, [timer]);

  return <span>{time}</span>;
}
