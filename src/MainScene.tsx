import * as React from "react";
import * as PIXI from "pixi.js";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Keyboard } from "./engine";
import { FreerunScene } from "./FreerunScene";
import { StoryScene } from "./StoryScene";
import { TitleScene } from "./TitleScene";

type MainKeys = "Escape";

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function MainScene({ app }: PropsType) {
  const navigate = useNavigate();

  React.useEffect(() => {
    const keyboard = new Keyboard<MainKeys>();

    keyboard.on(["Escape"], (pressed) => {
      if (pressed) {
        navigate("/");
      }
    });

    return () => {
      keyboard.destroy();
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<TitleScene />} />
      <Route path="/story" element={<StoryScene app={app} />} />
      <Route path="/freerun" element={<FreerunScene app={app} />} />
    </Routes>
  );
}
