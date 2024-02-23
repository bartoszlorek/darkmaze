import * as React from "react";
import { ANTICIPATION_TIME, TILE_SIZE } from "./consts";
import {
  ActionScreen,
  Button,
  InfoPanel,
  LabelText,
  TimeCounter,
} from "./components";
import { Timer } from "./core";
import { getMargin } from "./margin";
import { generateLevel } from "./generators";
import { createPlayer } from "./createPlayer";
import { MainStageLayer } from "./MainStageLayer";
import { useAppContext } from "./context";
import { useGameLoop } from "./useGameLoop";
import { useInstance } from "./useInstance";
import { usePlayerKeyboard } from "./usePlayerKeyboard";
import { usePlayerStatus } from "./usePlayerStatus";

type PropsType = Readonly<{
  dimension: number;
  seed: string;
  resetScene: () => void;
  quitScene: () => void;
}>;

export function FreerunScene1({
  dimension,
  seed,
  resetScene,
  quitScene,
}: PropsType) {
  const { app } = useAppContext();
  const timer = useInstance(() => new Timer());
  const level = useInstance(() => generateLevel(dimension, seed));
  const player = useInstance(() => createPlayer(level, true));
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
    timer.start();

    return () => {
      timer.destroy();
    };
  }, [timer]);

  React.useEffect(() => {
    level.subscribe("room_enter", ({ room }) => {
      switch (room.type) {
        case "evil":
          timer.stop();
          level.emit("reveal", undefined);
          player.setStatus("paused");
          setTimeout(() => player.setStatus("died"), ANTICIPATION_TIME);
          break;

        case "golden":
          timer.stop();
          level.emit("reveal", undefined);
          player.setStatus("paused");
          setTimeout(() => player.setStatus("won"), ANTICIPATION_TIME);
          break;
      }
    });
  }, [player, level, timer]);

  return (
    <>
      <MainStageLayer player={player} level={level} />
      <InfoPanel tileSize={TILE_SIZE} getMargin={getMargin}>
        <LabelText label="deaths" desktopOnly>
          0
        </LabelText>
        <LabelText label="time">
          <TimeCounter timer={timer} />
        </LabelText>
        <LabelText label="best">n/a</LabelText>
      </InfoPanel>

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
