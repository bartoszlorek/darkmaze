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

  // TODO: remove debug
  const visible = false;

  return () => {
    if (!visible) {
      return;
    }
    g.clear();

    const lights = getLights();
    const width = 8;

    for (const light of lights) {
      g.beginFill(0xffffff, light.intensity + 0.05);
      g.drawRect(light.x - width / 2, 0, width, window.innerHeight);
    }
  };
};
