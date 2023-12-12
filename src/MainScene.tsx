import * as React from "react";
import * as PIXI from "pixi.js";
import { HashRouter, Routes, Route } from "react-router-dom";
import { StoryScene } from "./StoryScene";
import { TitleScene } from "./TitleScene";

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function MainScene({ app }: PropsType) {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TitleScene />} />
        <Route path="/story" element={<StoryScene app={app} />} />
        <Route path="/freerun" element={<StoryScene app={app} />} />
      </Routes>
    </HashRouter>
  );
}
