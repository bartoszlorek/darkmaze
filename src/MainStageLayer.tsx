import * as React from "react";
import * as PIXI from "pixi.js";
import { LightsFilter } from "./LightsFilter";
import { StageLayer } from "./components";
import { GRID_SIZE } from "./consts";
import { useAppContext } from "./context";
import { Level, Player } from "./core";
import { drawFrame } from "./drawFrame";
import { drawLevel } from "./drawLevel";
import { drawPlayer } from "./drawPlayer";
import { createFrameBounds, createEmptyFrameBounds } from "./frame";
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
        const front = new PIXI.Container();
        const frame = new PIXI.Container();
        layer.addChild(back);
        layer.addChild(front);
        layer.addChild(frame);

        const frameBoundsRef = createEmptyFrameBounds();
        const redrawFrame = drawFrame({
          parent: frame,
          gridSize: GRID_SIZE,
          sprites,
        });

        const resize = () => {
          const halfSize = (level.dimension * GRID_SIZE) / 2;
          front.x = back.x = Math.floor(window.innerWidth / 2 - halfSize);
          front.y = back.y = Math.floor(window.innerHeight / 2 - halfSize);

          const frameBounds = createFrameBounds(
            frameBoundsRef,
            GRID_SIZE,
            GRID_SIZE
          );
          redrawFrame(frameBounds);
        };

        const unsubscribeResize = subscribeResize(resize);
        resize();

        const commonLightsFilter = new LightsFilter();
        back.filters = [commonLightsFilter];
        frame.filters = [commonLightsFilter];

        const getLights = createLights(level, player);
        const updateLightsFilter = () => {
          commonLightsFilter.setLights(getLights());
        };

        const redrawLevel = drawLevel({
          parent: back,
          level,
          gridSize: GRID_SIZE,
          sprites,
          debugMode,
        });

        const redrawPlayer = drawPlayer({
          parent: front,
          player,
          gridSize: GRID_SIZE,
          sprites,
        });

        return {
          redrawLevel,
          redrawPlayer,
          unsubscribeResize,
          updateLightsFilter,
        };
      }}
      onUpdate={(_, ctx) => {
        ctx.redrawLevel();
        ctx.redrawPlayer();
        ctx.updateLightsFilter();
      }}
      onUnmount={(_, ctx) => {
        ctx.unsubscribeResize();
      }}
    />
  );
}
