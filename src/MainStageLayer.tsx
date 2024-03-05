import * as React from "react";
import * as PIXI from "pixi.js";
import { TILE_SIZE } from "./consts";
import { Level, Player } from "./core";
import { subscribeResize } from "./helpers";
import { useAppContext } from "./context";
import { useGameLayer } from "./useGameLayer";
import {
  Camera,
  drawBackgroundMask,
  drawCompass,
  drawFrame,
  drawLevel,
  drawPlayer,
  createLights,
  FrameBounds,
  LightsFilter,
} from "./rendering";
import { getMargin } from "./margin";

type PropsType = Readonly<{
  player: Player;
  level: Level;
}>;

export function MainStageLayer({ player, level }: PropsType) {
  const { app, sprites, debugMode } = useAppContext();

  useGameLayer({
    app,
    onMount: (layer) => {
      const background = new PIXI.Container();
      const foreground = new PIXI.Container();
      background.addChild(background);

      // the ui elements
      const frame = new PIXI.Container();
      const frameBounds = new FrameBounds(TILE_SIZE, getMargin());
      const compass = new PIXI.Container();

      // compose the view
      layer.addChild(background);
      layer.addChild(foreground);
      layer.addChild(frame);
      layer.addChild(compass);

      const redrawBackgroundMask = drawBackgroundMask({
        parent: background,
        frame: frameBounds,
        tileSize: TILE_SIZE,
      });

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
        frame: frameBounds,
        sprites,
      });

      const camera = new Camera(background, TILE_SIZE);
      player.subscribe("move", () => camera.lookAt(player));

      const resize = () => {
        camera.lookAt(player);
        frameBounds.update(getMargin());
        redrawBackgroundMask();
        redrawFrame();
        redrawCompass();
      };

      const unsubscribeResize = subscribeResize(resize);
      resize();

      const normalLightsFilter = new LightsFilter(4);
      const delayedLightsFilter = new LightsFilter(4);
      background.filters = [delayedLightsFilter];
      frame.filters = [normalLightsFilter];

      const getLights = createLights(level, player);
      const updateLightsFilter = (deltaTime: number) => {
        const lights = getLights(deltaTime);
        normalLightsFilter.update(lights.normal);
        delayedLightsFilter.update(lights.delayed);
      };

      return {
        redrawLevel,
        redrawPlayer,
        unsubscribeResize,
        updateLightsFilter,
      };
    },

    onUpdate: (ctx, deltaTime) => {
      ctx.redrawLevel();
      ctx.redrawPlayer();
      ctx.updateLightsFilter(deltaTime);
    },

    onUnmount: (ctx) => {
      ctx.unsubscribeResize();
    },
  });

  return null;
}
