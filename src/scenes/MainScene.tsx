import * as React from "react";
import * as PIXI from "pixi.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoryScene } from "./StoryScene";
import { TitleScene } from "./TitleScene";

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function MainScene({ app }: PropsType) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitleScene />} />
        <Route path="/story" element={<StoryScene app={app} />} />
        <Route path="/freerun" element={<StoryScene app={app} />} />
      </Routes>
    </BrowserRouter>
  );
}
