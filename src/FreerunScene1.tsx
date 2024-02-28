import * as React from "react";
import { ANTICIPATION_TIME, TILE_SIZE } from "./consts";
import {
  ActionScreen,
  Button,
  InfoPanel,
  LabelText,
  Logger,
  TimeCounter,
} from "./components";
import { Timer } from "./core";
import { getMargin } from "./margin";
import { nth } from "./helpers";
import { generateLevel } from "./generators";
import { createPlayer } from "./createPlayer";
import { MainStageLayer } from "./MainStageLayer";
import { useAppContext } from "./context";
import { useGameLoop } from "./useGameLoop";
import { useInstance } from "./useInstance";
import { usePlayerKeyboard } from "./usePlayerKeyboard";
import { usePlayerStatus } from "./usePlayerStatus";
import { accessLevelStorage, LevelStats } from "./storage";

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

  const levelStorage = React.useMemo(() => {
    return accessLevelStorage({ seed, dimension });
  }, [seed, dimension]);

  const [levelStats, setLevelStats] = React.useState<LevelStats>(() => {
    return levelStorage.getValue();
  });

  const { deaths, bestTime } = levelStats;
  const formattedBestTime = React.useMemo(() => {
    if (bestTime !== null) {
      return new Timer(bestTime).toPreciseTime();
    }
    return "n/a";
  }, [bestTime]);

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
        case "evil": {
          timer.stop();

          // status
          player.setStatus("paused");
          setTimeout(() => player.setStatus("died"), ANTICIPATION_TIME);

          // data
          setLevelStats(addOneDeath);
          levelStorage.setValue(addOneDeath);
          break;
        }

        case "golden": {
          timer.stop();

          // status
          player.setStatus("paused");
          setTimeout(() => player.setStatus("won"), ANTICIPATION_TIME);

          // data
          setLevelStats(setBestTime(timer.getDuration()));
          levelStorage.setValue(setBestTime(timer.getDuration()));
          break;
        }
      }
    });
  }, [player, level, levelStorage, timer]);

  return (
    <>
      <Logger />
      <MainStageLayer player={player} level={level} />
      <InfoPanel tileSize={TILE_SIZE} getMargin={getMargin}>
        <LabelText label="deaths" desktopOnly>
          {deaths}
        </LabelText>
        <LabelText label="time">
          <TimeCounter timer={timer} />
        </LabelText>
        <LabelText label="best">{formattedBestTime}</LabelText>
      </InfoPanel>

      {playerStatus === "died" && (
        <ActionScreen title="you died" titleColor="red">
          <div>{youDiedCopy(deaths)}</div>
          <Button onClick={resetScene}>restart</Button>
          <Button onClick={quitScene}>quit</Button>
        </ActionScreen>
      )}
      {playerStatus === "won" && (
        <ActionScreen title="you won" titleColor="yellow">
          <div>{youWonCopy(deaths)}</div>
          <Button onClick={quitScene}>main menu</Button>
        </ActionScreen>
      )}
    </>
  );
}

const addOneDeath = (prev: LevelStats): LevelStats => ({
  ...prev,
  deaths: prev.deaths + 1,
});

const setBestTime =
  (nextBestTime: number) =>
  (prev: LevelStats): LevelStats => ({
    ...prev,
    bestTime: Math.min(prev.bestTime || Infinity, nextBestTime),
  });

const youDiedCopy = (deaths: number) => {
  return `${deaths}${nth(deaths)} death`;
};

const youWonCopy = (deaths: number) => {
  if (deaths === 0) return "without losing a life";
  if (deaths === 1) return "after 1 death";
  return `after ${deaths} deaths`;
};
