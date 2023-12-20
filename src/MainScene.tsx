import * as React from "react";
import * as PIXI from "pixi.js";
import { Routes, Route } from "react-router-dom";
import { FreerunSceneSettings } from "./FreerunSceneSettings";
import { FreerunScene } from "./FreerunScene";
import { StoryScene } from "./StoryScene";
import { TitleScene } from "./TitleScene";

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function MainScene({ app }: PropsType) {
  return (
    <Routes>
      <Route path="/" element={<TitleScene />} />
      <Route path="/story" element={<StoryScene app={app} />} />
      <Route path="/freerun" element={<FreerunSceneSettings />} />
      <Route path="/freerun/:seed">
        <Route index element={<FreerunScene app={app} />} />
        <Route path=":dimension" element={<FreerunScene app={app} />} />
      </Route>
    </Routes>
  );
}
