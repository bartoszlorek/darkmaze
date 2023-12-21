import * as React from "react";
import * as PIXI from "pixi.js";
import { useNavigate } from "react-router-dom";
import { Button, MenuScreen, SceneManager } from "./components";
import { FreerunScene1 } from "./FreerunScene1";
import { useDebug } from "./useDebug";
import { useMenu } from "./useMenu";
import { useSanitizedParams } from "./useSanitizedParams";

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function FreerunScene({ app }: PropsType) {
  const navigate = useNavigate();
  const [resetKey, setResetKey] = React.useState(0);
  const { seed, dimension } = useSanitizedParams();
  const debug = useDebug();
  const openMenu = useMenu();

  const resetScene = React.useCallback(() => {
    setResetKey((n) => n + 1);
  }, []);

  const quitScene = React.useCallback(() => {
    navigate("/freerun");
  }, [navigate]);

  return (
    <>
      <SceneManager
        resetKey={`${resetKey}/${seed}/${dimension}`}
        sceneIndex={0}
        scenes={[
          <FreerunScene1
            app={app}
            debug={debug}
            seed={seed}
            dimension={dimension}
            resetScene={resetScene}
            quitScene={quitScene}
          />,
        ]}
      />
      {openMenu && (
        <MenuScreen>
          <Button onClick={resetScene}>restart</Button>
          <Button onClick={quitScene}>quit</Button>
        </MenuScreen>
      )}
    </>
  );
}
