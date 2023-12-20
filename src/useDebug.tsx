import * as React from "react";

const style = {
  position: "absolute",
  right: 16,
  bottom: 16,
} as const;

export function useDebug() {
  const [debug, setDebug] = React.useState(false);

  const debugButton = (
    <button style={style} onClick={() => setDebug((bool) => !bool)}>
      debug {debug ? "[on]" : "[off]"}
    </button>
  );

  return {
    debugButton,
    debug,
  };
}
