import * as React from "react";
import { useNavigate } from "react-router-dom";
import { accessLocalStorage } from "./helpers";
import { ActionScreen, Button } from "./components";

type StorageType = Readonly<{
  debug: boolean;
}>;

const debugButtonStyle = {
  position: "absolute",
  right: 16,
  bottom: 16,
} as const;

export function TitleScene() {
  const navigate = useNavigate();
  const storage = React.useMemo(() => {
    return accessLocalStorage<StorageType>("darkmaze");
  }, []);

  const [debug, setDebug] = React.useState(() => {
    const { debug = false } = storage.getValue();
    storage.setValue({ debug });
    return debug;
  });

  const handleStoryClick = () => navigate("/story");
  const handleFreerunClick = () => navigate("/freerun");
  const handleDebugClick = () => {
    setDebug((prev) => {
      const debug = !prev;
      storage.setValue({ debug });
      return debug;
    });
  };

  return (
    <>
      <ActionScreen title="darkmaze">
        <Button onClick={handleStoryClick}>story</Button>
        <Button onClick={handleFreerunClick}>freerun</Button>
      </ActionScreen>
      <button style={debugButtonStyle} onClick={handleDebugClick}>
        debug {debug ? "[on]" : "[off]"}
      </button>
    </>
  );
}
