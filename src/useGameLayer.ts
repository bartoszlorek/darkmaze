import * as React from "react";
import * as PIXI from "pixi.js";

type PropsType<Context> = Readonly<{
  app: PIXI.Application;
  onMount: (layer: PIXI.Container) => Context;
  /**
   * @param deltaTime - number of milliseconds since the last update
   * @param deltaFrame - number of frames since the last update
   */
  onUpdate: (context: Context, deltaTime: number, deltaFrame: number) => void;
  onUnmount?: (context: Context, layer: PIXI.Container) => void;
}>;

export function useGameLayer<Context>({
  app,
  onMount,
  onUpdate,
  onUnmount,
}: PropsType<Context>) {
  const onMountRef = React.useRef(onMount);
  const onUpdateRef = React.useRef(onUpdate);
  const onUnmountRef = React.useRef(onUnmount);

  onUpdateRef.current = onUpdate;
  onUnmountRef.current = onUnmount;

  React.useEffect(() => {
    const layer = new PIXI.Container();
    const context = onMountRef.current?.(layer);

    const tickerCallback = (deltaFrame: number) =>
      onUpdateRef.current(context, app.ticker.deltaMS, deltaFrame);

    app.ticker.add(tickerCallback);
    app.stage.addChild(layer);

    return () => {
      app.ticker.remove(tickerCallback);
      onUnmountRef.current?.(context, layer);
      layer.destroy({ children: true });
    };
  }, [app]);
}
