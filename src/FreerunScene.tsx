import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button, MenuScreen, SceneManager } from "./components";
import { FreerunScene1 } from "./FreerunScene1";
import { useMenu } from "./useMenu";
import { useSanitizedParams } from "./useSanitizedParams";

export function FreerunScene() {
  const navigate = useNavigate();
  const menu = useMenu();
  const [resetKey, setResetKey] = React.useState(0);
  const { seed, dimension } = useSanitizedParams();

  const resetScene = React.useCallback(() => {
    setResetKey((n) => n + 1);
    menu.close();
  }, [menu]);

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
            seed={seed}
            dimension={dimension}
            resetScene={resetScene}
            quitScene={quitScene}
            menu={menu}
          />,
        ]}
      />
      {menu.isOpen && (
        <MenuScreen>
          <Button onClick={menu.close}>resume</Button>
          <Button onClick={resetScene}>restart</Button>
          <Button onClick={quitScene}>quit</Button>
        </MenuScreen>
      )}
    </>
  );
}
