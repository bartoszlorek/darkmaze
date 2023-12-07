import * as React from "react";
import type { SceneServiceRef } from "../machines";

type PropsType = Readonly<{
  sceneService: SceneServiceRef;
}>;

export function TitleScene({ sceneService }: PropsType) {
  const handleStoryClick = () => {
    sceneService.send({ type: "START_STORY" });
  };

  const handleFreerunClick = () => {
    sceneService.send({ type: "START_FREERUN" });
  };

  return (
    <div>
      <h1>darkmaze</h1>
      <button onClick={handleStoryClick}>story</button>
      <button onClick={handleFreerunClick}>freerun</button>
    </div>
  );
}
