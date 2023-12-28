import * as React from "react";
import * as PIXI from "pixi.js";
import { StageLayer } from "./components";
import { Level, Player } from "./core";
import { useAppContext } from "./context";
import { subscribeResize } from "./helpers";
import { drawLevel } from "./drawLevel";
import { drawPlayer } from "./drawPlayer";
import { GRID_SIZE } from "./consts";

type PropsType = Readonly<{
  player: Player;
  level: Level;
  levelRevealed?: boolean;
}>;

export function MainStageLayer({
  player,
  level,
  levelRevealed = false,
}: PropsType) {
  const { app, sprites, debug } = useAppContext();

  return (
    <StageLayer
      app={app}
      onMount={(layer) => {
        const parent = new PIXI.Container();
        const centerParent = () => {
          const halfSize = (level.dimension * GRID_SIZE) / 2;
          parent.x = Math.floor(window.innerWidth / 2 - halfSize);
          parent.y = Math.floor(window.innerHeight / 2 - halfSize);
        };

        const unsubscribeResize = subscribeResize(centerParent);
        centerParent();

        const redrawLevel = drawLevel({
          parent,
          level,
          gridSize: GRID_SIZE,
          debug,
        });

        const redrawPlayer = drawPlayer({
          parent,
          player,
          gridSize: GRID_SIZE,
          sprites,
        });

        layer.addChild(parent);

        return {
          redrawLevel,
          redrawPlayer,
          unsubscribeResize,
        };
      }}
      onUpdate={(_, ctx) => {
        ctx.redrawLevel(levelRevealed);
        ctx.redrawPlayer();
      }}
      onUnmount={(_, ctx) => {
        ctx.unsubscribeResize();
      }}
    />
  );
}
