import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { FreerunSceneSettings } from "./FreerunSceneSettings";
import { FreerunScene } from "./FreerunScene";
import { StoryScene } from "./StoryScene";
import { TitleScene } from "./TitleScene";
import { LightTest } from "./LightTest";
import "./components/_global.scss";

export function MainScene() {
  return (
    <Routes>
      <Route path="/" element={<TitleScene />} />
      <Route path="/story" element={<StoryScene />} />
      <Route path="/freerun" element={<FreerunSceneSettings />} />
      <Route path="/freerun/:seed">
        <Route index element={<FreerunScene />} />
        <Route path=":dimension" element={<FreerunScene />} />
      </Route>
      <Route path="/light-test" element={<LightTest />} />
    </Routes>
  );
}
