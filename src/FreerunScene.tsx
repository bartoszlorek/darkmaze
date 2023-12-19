import * as React from "react";
import * as PIXI from "pixi.js";
import { FreerunScenePlay } from "./FreerunScenePlay";

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function FreerunScene({ app }: PropsType) {
  const [debug, setDebug] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);

  const resetScene = React.useCallback(() => {
    setResetKey((n) => n + 1);
  }, []);

  return (
    <>
      <FreerunScenePlay
        app={app}
        key={resetKey}
        dimension={8}
        resetScene={resetScene}
        debug={debug}
      />
      <button
        style={{ position: "absolute", right: 16, bottom: 16 }}
        onClick={() => setDebug((bool) => !bool)}
      >
        debug {debug ? "[on]" : "[off]"}
      </button>
    </>
  );
}
