import * as React from "react";
import { ANTICIPATION_TIME } from "./consts";
import { ActionScreen, Button, Compass, PathLights } from "./components";
import { Level } from "./core";
import { generateRooms } from "./generators";
import { createPlayer } from "./createPlayer";
import { MainStageLayer } from "./MainStageLayer";
import { useAppContext } from "./context";
import { useGameLoop } from "./useGameLoop";
import { useInstance } from "./useInstance";
import { usePlayerKeyboard } from "./usePlayerKeyboard";
import { usePlayerStatus } from "./usePlayerStatus";

type PropsType = Readonly<{
  debug: boolean;
  dimension: number;
  seed: string;
  resetScene: () => void;
  quitScene: () => void;
}>;

export function FreerunScene1({
  debug,
  dimension,
  seed,
  resetScene,
  quitScene,
}: PropsType) {
  const { app } = useAppContext();
  const level = useInstance(() => new Level(generateRooms(dimension, seed)));
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
        player={player}
        level={level}
        levelRevealed={debug || player.status === "won"}
      />
      <PathLights player={player} />
      <Compass player={player} level={level} />
      {playerStatus === "died" && (
        <ActionScreen title="you died" titleColor="red">
          <Button onClick={resetScene}>restart</Button>
        </ActionScreen>
      )}
      {playerStatus === "won" && (
        <ActionScreen title="you won" titleColor="yellow">
          <Button onClick={quitScene}>main menu</Button>
        </ActionScreen>
      )}
    </>
  );
}