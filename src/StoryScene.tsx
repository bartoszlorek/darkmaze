import * as React from "react";
import * as PIXI from "pixi.js";
import { useNavigate } from "react-router-dom";
import { SceneManager } from "./components";
import { Keyboard } from "./engine";
import { StoryScene1 } from "./StoryScene1";
import { StoryScene2 } from "./StoryScene2";

type StoryKeys = "Escape";

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function StoryScene({ app }: PropsType) {
  const navigate = useNavigate();
  const [sceneIndex, setSceneIndex] = React.useState(0);
  const [resetKey, setResetKey] = React.useState(0);

  const nextScene = React.useCallback(() => {
    setSceneIndex((n) => n + 1);
  }, []);

  const resetScene = React.useCallback(() => {
    setResetKey((n) => n + 1);
  }, []);

  React.useEffect(() => {
    const keyboard = new Keyboard<StoryKeys>();
    keyboard.on(["Escape"], (pressed) => {
      if (pressed) navigate("/");
    });

    return () => {
      keyboard.destroy();
    };
  }, [navigate]);

  return (
    <SceneManager
      resetKey={resetKey}
      sceneIndex={sceneIndex}
      scenes={[
        <StoryScene1 app={app} nextScene={nextScene} />,
        <StoryScene2 app={app} resetScene={resetScene} />,
      ]}
    />
  );
}
