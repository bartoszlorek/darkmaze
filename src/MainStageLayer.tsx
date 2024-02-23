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
      // the gameplay elements
      const world = new PIXI.Container();
      const worldMask = new PIXI.Graphics();
      const background = new PIXI.Container();
      const foreground = new PIXI.Container();
      world.addChild(background);
      world.addChild(foreground);
      world.mask = worldMask;

      // the ui elements
      const frame = new PIXI.Container();
      const compass = new PIXI.Container();

      // compose the view
      layer.addChild(world);
      layer.addChild(frame);
      layer.addChild(compass);

      const frameBounds = new FrameBounds(TILE_SIZE, getMargin());
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
        frameBounds.update(getMargin());
        worldMask
          .clear()
          .beginFill(0xffffff)
          .drawRect(
            frameBounds.left + TILE_SIZE,
            frameBounds.top + TILE_SIZE,
            frameBounds.width - TILE_SIZE * 2,
            frameBounds.height - TILE_SIZE * 2
          );
        redrawFrame();
        redrawCompass();
        camera.lookAt(player);
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
