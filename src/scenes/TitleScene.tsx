import * as React from "react";
import { useNavigate } from "react-router-dom";

export function TitleScene() {
  const navigate = useNavigate();
  const handleStoryClick = () => navigate("/story");
  const handleFreerunClick = () => navigate("/freerun");

  return (
    <div>
      <h1>darkmaze</h1>
      <button onClick={handleStoryClick}>story</button>
      <button onClick={handleFreerunClick}>freerun</button>
    </div>
  );
}
