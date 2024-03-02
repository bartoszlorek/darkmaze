import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useMenu } from "./useMenu";
import { Button, MenuScreen, SceneManager } from "./components";
import { StoryScene1 } from "./StoryScene1";
import { StoryScene2 } from "./StoryScene2";
import { StoryScene3 } from "./StoryScene3";

export function StoryScene() {
  const navigate = useNavigate();
  const menu = useMenu();
  const [resetKey, setResetKey] = React.useState(0);
  const [sceneIndex, setSceneIndex] = React.useState(0);

  const nextScene = React.useCallback(() => {
    setSceneIndex((n) => n + 1);
  }, []);

  const resetScene = React.useCallback(() => {
    setResetKey((n) => n + 1);
    menu.close();
  }, [menu]);

  const exitScene = React.useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <>
      <SceneManager
        resetKey={resetKey}
        sceneIndex={sceneIndex}
        scenes={[
          <StoryScene1 menu={menu} nextScene={nextScene} />,
          <StoryScene2
            menu={menu}
            nextScene={nextScene}
            resetScene={resetScene}
          />,
          <StoryScene3
            menu={menu}
            nextScene={exitScene}
            resetScene={resetScene}
          />,
        ]}
      />
      {menu.isOpen && (
        <MenuScreen>
          <Button onClick={menu.close}>resume</Button>
          <Button onClick={resetScene}>restart</Button>
          <Button onClick={() => navigate("/")}>main menu</Button>
        </MenuScreen>
      )}
    </>
  );
}
