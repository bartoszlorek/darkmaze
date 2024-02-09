import * as React from "react";
import * as PIXI from "pixi.js";

import { TILE_SIZE } from "./consts";
import { Level, Player } from "./core";
import { subscribeResize } from "./helpers";
import { useAppContext } from "./context";
import { useGameLayer } from "./useGameLayer";
import {
  Camera,
  drawCompass,
  drawFrame,
  drawLevel,
  drawPlayer,
  createLights,
  FrameBounds,
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
      // the gameplay elements
      const world = new PIXI.Container();
      const background = new PIXI.Container();
      const foreground = new PIXI.Container();
      world.addChild(background);
      world.addChild(foreground);

      // the ui elements
      const frame = new PIXI.Container();
      const compass = new PIXI.Container();

      // compose the view
      layer.addChild(world);
      layer.addChild(frame);
      layer.addChild(compass);

      const frameBounds = new FrameBounds();
      const redrawFrame = drawFrame({
        parent: frame,
        frame: frameBounds,
        tileSize: TILE_SIZE,
        sprites,
      });

      const redrawCompass = drawCompass({
        parent: compass,
        player,
        level,
        frame: frameBounds,
        tileSize: TILE_SIZE,
        sprites,
      });

      const camera = new Camera(world, TILE_SIZE);
      player.subscribe("move", () => camera.lookAt(player));

      const resize = () => {
        camera.lookAt(player);
        const margin = window.innerWidth > 800 ? TILE_SIZE : TILE_SIZE / 4;
        frameBounds.update(TILE_SIZE, margin);
        redrawFrame();
        redrawCompass();
      };

      const unsubscribeResize = subscribeResize(resize);
      resize();

      const commonLightsFilter = new LightsFilter();
      background.filters = [commonLightsFilter];
      frame.filters = [commonLightsFilter];

      const getLights = createLights(level, player);
      const updateLightsFilter = () => {
        commonLightsFilter.setLights(getLights());
      };

      const redrawLevel = drawLevel({
        parent: background,
        level,
        tileSize: TILE_SIZE,
        sprites,
        debugMode,
      });

      const redrawPlayer = drawPlayer({
        parent: foreground,
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
