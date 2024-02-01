import * as PIXI from "pixi.js";
import { DrawFunction } from "./helpers";
import { createLights } from "./lights";
import type { Player, Level } from "./core";

export const drawLights: DrawFunction<{
  player: Player;
  level: Level;
}> = ({ parent, player, level }) => {
  const getLights = createLights(level, player);

  const g = new PIXI.Graphics();
  parent.addChild(g);

  return () => {
    g.clear();
    const lights = getLights();

    g.beginFill(0xffffff, lights[0].intensity + 0.1);
    g.drawRect(lights[0].x, 0, 4, window.innerHeight);

    g.beginFill(0xffffff, lights[1].intensity + 0.1);
    g.drawRect(lights[1].x, 0, 4, window.innerHeight);

    g.beginFill(0xffffff, lights[2].intensity + 0.1);
    g.drawRect(lights[2].x, 0, 4, window.innerHeight);

    g.beginFill(0xffffff, lights[3].intensity + 0.1);
    g.drawRect(lights[3].x, 0, 4, window.innerHeight);
  };
};
