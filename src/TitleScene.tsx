import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ActionScreen, Button, Controls, Version } from "./components";
import { isTouchDevice } from "./helpers";
import { accessMainStorage } from "./storage";

export function TitleScene() {
  const navigate = useNavigate();
  const handleStoryClick = () => navigate("/story");
  const handleFreerunClick = () => navigate("/freerun");

  const { finishedStory } = React.useMemo(() => {
    return accessMainStorage().getValue();
  }, []);

  return (
    <ActionScreen title="darkmaze">
      <Button onClick={handleStoryClick}>story</Button>
      <Button onClick={handleFreerunClick} locked={!finishedStory}>
        freerun
      </Button>
      <Controls
        type={isTouchDevice() ? "mobile" : "desktop"}
        label="controls"
      />
      <Version>{__VERSION__}</Version>
    </ActionScreen>
  );
}
