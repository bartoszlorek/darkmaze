import * as React from "react";
import * as PIXI from "pixi.js";
import { StageLayer } from "./components";
import { Level, Player } from "./core";
import { useAppContext } from "./context";
import { subscribeResize } from "./helpers";
import { drawDarkness } from "./drawDarkness";
import { drawLevel } from "./drawLevel";
import { drawPlayer } from "./drawPlayer";
import { GRID_SIZE } from "./consts";

type PropsType = Readonly<{
  player: Player;
  level: Level;
}>;

export function MainStageLayer({ player, level }: PropsType) {
  const { app, sprites, debugMode } = useAppContext();

  return (
    <StageLayer
      app={app}
      onMount={(layer) => {
        const back = new PIXI.Container();
        const middle = new PIXI.Container();
        const front = new PIXI.Container();
        layer.addChild(back);
        layer.addChild(middle);
        layer.addChild(front);

        const centerView = () => {
          const halfSize = (level.dimension * GRID_SIZE) / 2;
          front.x = back.x = Math.floor(window.innerWidth / 2 - halfSize);
          front.y = back.y = Math.floor(window.innerHeight / 2 - halfSize);
        };

        const unsubscribeResize = subscribeResize(centerView);
        centerView();

        const redrawLevel = drawLevel({
          parent: back,
          level,
          gridSize: GRID_SIZE,
          sprites,
          debugMode,
        });

        const redrawDarkness = drawDarkness({
          parent: middle,
          player,
          level,
          gridSize: GRID_SIZE,
        });

        const redrawPlayer = drawPlayer({
          parent: front,
          player,
          gridSize: GRID_SIZE,
          sprites,
        });

        return {
          redrawLevel,
          redrawDarkness,
          redrawPlayer,
          unsubscribeResize,
        };
      }}
      onUpdate={(_, ctx) => {
        ctx.redrawLevel();
        ctx.redrawDarkness();
        ctx.redrawPlayer();
      }}
      onUnmount={(_, ctx) => {
        ctx.unsubscribeResize();
      }}
    />
  );
}
