import * as React from "react";
import { Player, PlayerStatus, PLAYER_DEFAULT_STATUS } from "./core";

type PropsType = Readonly<{
  player: Player;
}>;

export function usePlayerStatus({ player }: PropsType) {
  const [status, setStatus] = React.useState<PlayerStatus>(
    PLAYER_DEFAULT_STATUS
  );

  React.useEffect(() => {
    const unsubscribe = player.subscribe("status", (payload) => {
      setStatus(payload.value);
    });

    return () => {
      unsubscribe();
    };
  }, [player]);

  return status;
}
