import * as React from "react";
import * as PIXI from "pixi.js";

type PropsType<Context> = Readonly<{
  app: PIXI.Application;
  onMount: (layer: PIXI.Container) => Context;
  onUnmount: (layer: PIXI.Container, context: Context) => void;
  onUpdate: (deltaTime: number, context: Context) => void;
}>;

export function useGameLayer<Context>({
  app,
  onMount,
  onUnmount,
  onUpdate,
}: PropsType<Context>) {
  const onMountRef = React.useRef(onMount);
  const onUnmountRef = React.useRef(onUnmount);
  const onUpdateRef = React.useRef(onUpdate);

  onUnmountRef.current = onUnmount;
  onUpdateRef.current = onUpdate;

  React.useEffect(() => {
    const layer = new PIXI.Container();
    const context = onMountRef.current?.(layer);

    const tickerCallback = (deltaTime: number) => {
      onUpdateRef.current(deltaTime, context);
    };

    app.ticker.add(tickerCallback);
    app.stage.addChild(layer);

    return () => {
      app.ticker.remove(tickerCallback);
      onUnmountRef.current(layer, context);
      layer.destroy({ children: true });
    };
  }, [app]);
}
