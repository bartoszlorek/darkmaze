import * as React from "react";
import * as PIXI from "pixi.js";
import { AppStageLayer } from "../components";
import { subscribeResize } from "../utils";
import { drawLevel } from "./drawLevel";
import { drawPlayer } from "./drawPlayer";
import { Level } from "../Level";
import { Player } from "../Player";

const GRID_SIZE = 48;

type PropsType = Readonly<{
  app: PIXI.Application;
  player: Player;
  level: Level;
}>;

export function MainStageLayer({ app, player, level }: PropsType) {
  return (
    <AppStageLayer
      app={app}
      onMount={(layer) => {
        const parent = new PIXI.Container();
        const centerParent = () => {
          const halfSize = (level.dimension * GRID_SIZE) / 2;
          parent.x = window.innerWidth / 2 - halfSize;
          parent.y = window.innerHeight / 2 - halfSize;
        };

        const unsubscribeResize = subscribeResize(centerParent);
        centerParent();

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

        layer.addChild(parent);

        return {
          redrawLevel,
          redrawPlayer,
          unsubscribeResize,
        };
      }}
      onUpdate={(_, ctx) => {
        ctx.redrawLevel();
        ctx.redrawPlayer();
      }}
      onUnmount={(_, ctx) => {
        ctx.unsubscribeResize();
      }}
    />
  );
}
