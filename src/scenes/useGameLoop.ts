import * as React from "react";
import * as PIXI from "pixi.js";
import { Level } from "../Level";
import { Player } from "../Player";

type PropsType = Readonly<{
  app: PIXI.Application;
  player: Player;
  level: Level;
}>;

export function useGameLoop({ app, player, level }: PropsType) {
  React.useEffect(() => {
    const tick = (deltaTime: number) => {
      const currentRoom = level.updateCurrentRoom(player);
      player.update(deltaTime, currentRoom);
    };

    app.ticker.add(tick);
    return () => {
      app.ticker.remove(tick);
    };
  }, [app, player, level]);
}
