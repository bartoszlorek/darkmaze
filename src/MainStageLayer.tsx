import * as React from "react";
import * as PIXI from "pixi.js";
import { LightsFilter } from "./LightsFilter";
import { StageLayer } from "./components";
import { GRID_SIZE } from "./consts";
import { useAppContext } from "./context";
import { Level, Player } from "./core";
import { drawLevel } from "./drawLevel";
import { drawLights } from "./drawLights";
import { drawPlayer } from "./drawPlayer";
import { subscribeResize } from "./helpers";
import { createLights } from "./lights";

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

        const backLights = new LightsFilter();
        back.filters = [backLights];

        const getLights = createLights(level, player);
        const updateLevelLights = () => {
          backLights.setRadius(window.innerWidth / 3);
          backLights.setLights(getLights());
        };

        const redrawLevel = drawLevel({
          parent: back,
          level,
          gridSize: GRID_SIZE,
          sprites,
          debugMode,
        });

        const redrawLights = drawLights({
          parent: middle,
          player,
          level,
        });

        const redrawPlayer = drawPlayer({
          parent: front,
          player,
          gridSize: GRID_SIZE,
          sprites,
        });

        return {
          redrawLevel,
          redrawLights,
          redrawPlayer,
          unsubscribeResize,
          updateLevelLights,
        };
      }}
      onUpdate={(_, ctx) => {
        ctx.redrawLevel();
        ctx.redrawLights();
        ctx.redrawPlayer();
        ctx.updateLevelLights();
      }}
      onUnmount={(_, ctx) => {
        ctx.unsubscribeResize();
      }}
    />
  );
}
