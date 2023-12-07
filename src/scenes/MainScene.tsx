import * as React from "react";
import * as PIXI from "pixi.js";
import { useMachine } from "@xstate/react";
import { sceneMachine } from "../machines";
import { StoryScene } from "./StoryScene";
import { TitleScene } from "./TitleScene";

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function MainScene({ app }: PropsType) {
  const [state, send, sceneService] = useMachine(sceneMachine);

  switch (state.value) {
    case "title":
      return <TitleScene sceneService={sceneService} />;

    case "story":
      return <StoryScene app={app} sceneService={sceneService} />;

    case "freerun":
      return <StoryScene app={app} sceneService={sceneService} />;

    default:
      return null;
  }
}
