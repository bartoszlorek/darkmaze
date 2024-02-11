import * as React from "react";
import * as PIXI from "pixi.js";

import { Button } from "./components";
import { useAppContext } from "./context";
import { useGameLayer } from "./useGameLayer";
import { useInstance } from "./useInstance";
import { Diagram, Light } from "./rendering";

export function LightTest() {
  const { app } = useAppContext();
  const lightA = useInstance(() => new Light());
  const lightB = useInstance(() => new Light());

  const [turnOn, setTurnOn] = React.useState(false);
  const toggleLights = () => {
    setTurnOn((a) => !a);

    if (turnOn) {
      lightA.setIntensity(0);
      lightB.setIntensity(0, 250);
    } else {
      lightA.setIntensity(1);
      lightB.setIntensity(1, 250);
    }
  };

  useGameLayer({
    app,
    onMount: (layer) => {
      const margin = 20;
      const diagramA = new Diagram(20, 0);
      const diagramB = new Diagram(20, 0);
      const diagramOffset = diagramA.viewHeight + margin;

      diagramA.x = diagramB.x = margin;
      diagramA.y = margin + diagramOffset * 0;
      diagramB.y = margin + diagramOffset * 1;

      const g = new PIXI.Graphics();
      g.x = margin * 2 + diagramA.viewWidth;
      g.y = margin;

      layer.addChild(diagramA);
      layer.addChild(diagramB);
      layer.addChild(g);

      return {
        margin,
        diagramA,
        diagramB,
        g,
        acc: 0,
      };
    },
    onUpdate: (ctx, deltaTime) => {
      lightA.update(deltaTime);
      lightB.update(deltaTime);

      const bulbSize = ctx.diagramA.viewHeight;
      const bulbOffset = bulbSize + ctx.margin;
      const bulbColor = 0xd4e2cc;

      ctx.g.clear();
      ctx.g
        .beginFill(bulbColor, lightA.intensity)
        .drawRect(0, bulbOffset * 0, bulbSize, bulbSize);

      ctx.g
        .beginFill(bulbColor, lightB.intensity)
        .drawRect(0, bulbOffset * 1, bulbSize, bulbSize);

      ctx.acc += deltaTime;
      if (ctx.acc > 25) {
        ctx.diagramA.add(lightA.intensity);
        ctx.diagramB.add(lightB.intensity);
        ctx.acc = 0;
      }
    },
  });

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20 }}>
      <Button onClick={toggleLights}>{turnOn ? "turn off" : "turn on"}</Button>
    </div>
  );
}
