import * as React from "react";
import * as PIXI from "pixi.js";
import { ANTICIPATION_TIME } from "./consts";
import { ActionScreen, Button, Compass, PathLights } from "./components";
import { generateRooms } from "./generators/algorithm";
import { createPlayer } from "./createPlayer";
import { Level } from "./Level";
import { MainStageLayer } from "./MainStageLayer";
import { useGameLoop } from "./useGameLoop";
import { useInstance } from "./useInstance";
import { usePlayerKeyboard } from "./usePlayerKeyboard";
import { usePlayerStatus } from "./usePlayerStatus";

type PropsType = Readonly<{
  app: PIXI.Application;
  dimension: number;
  resetScene: () => void;
  debug: boolean;
}>;

export function FreerunScenePlay({
  app,
  dimension,
  resetScene,
  debug,
}: PropsType) {
  const level = useInstance(() => new Level(generateRooms(dimension)));
  const player = useInstance(() => createPlayer(level));
  const playerStatus = usePlayerStatus({ player });

  usePlayerKeyboard({
    player,
    playerStatus,
  });

  useGameLoop({
    app,
    player,
    level,
  });

  React.useEffect(() => {
    level.subscribe("room_enter", ({ room }) => {
      switch (room.type) {
        case "evil":
          player.setStatus("paused");
          setTimeout(() => player.setStatus("died"), ANTICIPATION_TIME);
          break;

        case "golden":
          player.setStatus("paused");
          setTimeout(() => player.setStatus("won"), ANTICIPATION_TIME);
          break;
      }
    });
  }, [player, level]);

  return (
    <>
      <MainStageLayer
        app={app}
        player={player}
        level={level}
        levelRevealed={debug || player.status === "won"}
      />
      <PathLights player={player} />
      <Compass player={player} level={level} />
      {playerStatus === "died" && (
        <ActionScreen
          title="you died"
          titleColor="red"
          actions={<Button onClick={resetScene}>reset</Button>}
        />
      )}
      {playerStatus === "won" && (
        <ActionScreen
          title="you won"
          titleColor="yellow"
          actions={<Button onClick={resetScene}>continue</Button>}
        />
      )}
    </>
  );
}
