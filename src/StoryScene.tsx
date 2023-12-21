import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useDebug } from "./useDebug";
import { useMenu } from "./useMenu";
import { Button, MenuScreen, SceneManager } from "./components";
import { StoryScene1 } from "./StoryScene1";
import { StoryScene2 } from "./StoryScene2";
import { StoryScene3 } from "./StoryScene3";

export function StoryScene() {
  const navigate = useNavigate();
  const [resetKey, setResetKey] = React.useState(0);
  const [sceneIndex, setSceneIndex] = React.useState(0);
  const debug = useDebug();
  const openMenu = useMenu();

  const nextScene = React.useCallback(() => {
    setSceneIndex((n) => n + 1);
  }, []);

  const resetScene = React.useCallback(() => {
    setResetKey((n) => n + 1);
  }, []);

  const exitScene = React.useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <>
      <SceneManager
        resetKey={resetKey}
        sceneIndex={sceneIndex}
        scenes={[
          <StoryScene1 debug={debug} nextScene={nextScene} />,
          <StoryScene2
            debug={debug}
            nextScene={nextScene}
            resetScene={resetScene}
          />,
          <StoryScene3
            debug={debug}
            nextScene={exitScene}
            resetScene={resetScene}
          />,
        ]}
      />
      {openMenu && (
        <MenuScreen>
          <Button onClick={resetScene}>restart</Button>
          <Button onClick={() => navigate("/")}>main menu</Button>
        </MenuScreen>
      )}
    </>
  );
}
