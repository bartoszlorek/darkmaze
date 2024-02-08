import * as React from "react";
import * as PIXI from "pixi.js";

import { TILE_SIZE } from "./consts";
import { Level, Player } from "./core";
import { subscribeResize } from "./helpers";
import { useAppContext } from "./context";
import { useGameLayer } from "./useGameLayer";
import {
  drawFrame,
  drawLevel,
  drawPlayer,
  createFrameBounds,
  createEmptyFrameBounds,
  createLights,
  LightsFilter,
} from "./rendering";

type PropsType = Readonly<{
  player: Player;
  level: Level;
}>;

export function MainStageLayer({ player, level }: PropsType) {
  const { app, sprites, debugMode } = useAppContext();

  useGameLayer({
    app,
    onMount: (layer) => {
      const back = new PIXI.Container();
      const front = new PIXI.Container();
      const frame = new PIXI.Container();
      layer.addChild(back);
      layer.addChild(front);
      layer.addChild(frame);

      const frameBoundsRef = createEmptyFrameBounds();
      const redrawFrame = drawFrame({
        parent: frame,
        tileSize: TILE_SIZE,
        sprites,
      });

      const resize = () => {
        const halfSize = (level.dimension * TILE_SIZE) / 2;
        front.x = back.x = Math.floor(window.innerWidth / 2 - halfSize);
        front.y = back.y = Math.floor(window.innerHeight / 2 - halfSize);

        const frameBounds = createFrameBounds(
          frameBoundsRef,
          TILE_SIZE,
          TILE_SIZE
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
        tileSize: TILE_SIZE,
        sprites,
        debugMode,
      });

      const redrawPlayer = drawPlayer({
        parent: front,
        player,
        tileSize: TILE_SIZE,
        sprites,
      });

      return {
        redrawLevel,
        redrawPlayer,
        unsubscribeResize,
        updateLightsFilter,
      };
    },

    onUpdate: (_, ctx) => {
      ctx.redrawLevel();
      ctx.redrawPlayer();
      ctx.updateLightsFilter();
    },

    onUnmount: (_, ctx) => {
      ctx.unsubscribeResize();
    },
  });

  return null;
}
