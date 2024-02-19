import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ActionScreen, Button, Version } from "./components";

export function TitleScene() {
  const navigate = useNavigate();
  const handleStoryClick = () => navigate("/story");
  const handleFreerunClick = () => navigate("/freerun");

  return (
    <ActionScreen title="darkmaze">
      <Button onClick={handleStoryClick}>story</Button>
      <Button onClick={handleFreerunClick}>freerun</Button>
      <Version>{__VERSION__}</Version>
    </ActionScreen>
  );
}
