import * as React from "react";
import * as PIXI from "pixi.js";
import { ActionScreen, Button, Compass, PathLights } from "./components";
import { Level } from "./Level";
import { Player } from "./Player";
import { Room } from "./Room";
import { MainStageLayer } from "./MainStageLayer";
import { useGameLoop } from "./useGameLoop";
import { useInstance } from "./useInstance";
import { usePlayerKeyboard } from "./usePlayerKeyboard";
import { usePlayerStatus } from "./usePlayerStatus";
import { ANTICIPATION_TIME } from "./consts";

type PropsType = Readonly<{
  app: PIXI.Application;
  nextScene: () => void;
  resetScene: () => void;
}>;

export function StoryScene3({ app, nextScene, resetScene }: PropsType) {
  const player = useInstance(() => new Player(2, 1, 0));
  const level = useInstance(() => new Level(createRooms()));
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

        default: {
          const adjacentRooms = level.getAdjacentRooms(room);
          console.log({ adjacentRooms });
        }
      }
    });
  }, [player, level]);

  return (
    <>
      <MainStageLayer app={app} player={player} level={level} />
      <PathLights player={player} />
      <Compass player={player} />
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
          actions={<Button onClick={nextScene}>continue</Button>}
        />
      )}
    </>
  );
}

function createRooms(): Room[] {
  return [
    new Room(0, 0, [1, 1, 0, 1], "evil"),
    new Room(1, 0, [1, 0, 1, 1], "golden"),
    new Room(2, 0, [1, 0, 1, 0]),
    new Room(3, 0, [1, 1, 0, 0]),

    new Room(0, 1, [0, 0, 0, 1]),
    new Room(1, 1, [1, 0, 1, 0]),
    new Room(2, 1, [1, 1, 1, 0]),
    new Room(3, 1, [0, 1, 0, 1]),

    new Room(0, 2, [0, 1, 0, 1]),
    new Room(1, 2, [1, 0, 1, 1], "evil"),
    new Room(2, 2, [1, 0, 0, 0]),
    new Room(3, 2, [0, 1, 0, 0]),

    new Room(0, 3, [0, 0, 1, 1]),
    new Room(1, 3, [1, 0, 1, 0]),
    new Room(2, 3, [0, 1, 1, 0]),
    new Room(3, 3, [0, 1, 1, 1], "evil"),
  ];
}