import "./Main.module.scss";
import * as React from "react";
import * as PIXI from "pixi.js";
import { Compass } from "./Compass";
import { GameViewLayer } from "./GameViewLayer";
import { Logger } from "./Logger";
import { drawLevel } from "./drawLevel";
import { drawPlayer } from "./drawPlayer";
import { useLevel } from "./useLevel";
import { usePlayer } from "./usePlayer";

const GRID_SIZE = 48;

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function Main({ app }: PropsType) {
  const player = usePlayer();
  const level = useLevel();
  console.log("--MainRender");

  React.useEffect(() => {
    const handleGameLoop = (deltaTime: number) => {
      const currentRoom = level.findCurrentRoom(player);
      player.update(deltaTime, currentRoom);
    };

    app.ticker.add(handleGameLoop);

    return () => {
      app.ticker.remove(handleGameLoop);
    };
  }, [app, level, player]);

  return (
    <>
      <GameViewLayer
        app={app}
        onMount={(layer) => {
          const parent = new PIXI.Container();
          const levelMiddle = (level.dimension * GRID_SIZE) / 2;
          parent.x = window.innerWidth / 2 - levelMiddle;
          parent.y = window.innerHeight / 2 - levelMiddle;
          layer.addChild(parent);

          const redrawLevel = drawLevel({
            parent,
            level,
            gridSize: GRID_SIZE,
          });

          const redrawPlayer = drawPlayer({
            parent,
            player,
            gridSize: GRID_SIZE,
          });

          return {
            redrawLevel,
            redrawPlayer,
          };
        }}
        onUpdate={(deltaTime, context) => {
          context.redrawLevel();
          context.redrawPlayer();
        }}
      />
      <Logger player={player} />
      <Compass player={player} />
    </>
  );
}
