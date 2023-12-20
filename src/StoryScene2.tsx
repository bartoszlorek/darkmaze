import * as React from "react";
import * as PIXI from "pixi.js";
import { ANTICIPATION_TIME, DIALOGUES } from "./consts";
import { createPlayer } from "./createPlayer";
import {
  ActionScreen,
  Button,
  Compass,
  Dialog,
  PathLights,
} from "./components";
import { Level } from "./Level";
import { Room, isEvil } from "./Room";
import { MainStageLayer } from "./MainStageLayer";
import { useDialog } from "./useDialog";
import { useGameLoop } from "./useGameLoop";
import { useInstance } from "./useInstance";
import { usePlayerKeyboard } from "./usePlayerKeyboard";
import { usePlayerStatus } from "./usePlayerStatus";

type PropsType = Readonly<{
  app: PIXI.Application;
  debug: boolean;
  nextScene: () => void;
  resetScene: () => void;
}>;

export function StoryScene2({ app, debug, nextScene, resetScene }: PropsType) {
  const level = useInstance(() => new Level(createRooms()));
  const player = useInstance(() => createPlayer(level));
  const playerStatus = usePlayerStatus({ player });
  const [dialog, setDialog] = useDialog(DIALOGUES);

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

        case "passage":
          player.setStatus("exiting");
          setTimeout(nextScene, ANTICIPATION_TIME);
          break;

        default: {
          if (level.someAdjacentConnectedRooms(room, isEvil)) {
            setDialog("evil");
          }
        }
      }
    });
  }, [player, level, nextScene, setDialog]);

  return (
    <>
      <MainStageLayer
        app={app}
        player={player}
        level={level}
        levelRevealed={debug}
      />
      <PathLights player={player} />
      <Compass player={player} level={level} />
      {dialog !== null && <Dialog value={dialog} />}
      {playerStatus === "died" && (
        <ActionScreen title="you died" titleColor="red">
          <Button onClick={resetScene}>reset</Button>
        </ActionScreen>
      )}
    </>
  );
}

function createRooms(): Room[] {
  return [
    new Room(0, 0, [1, 0, 0, 1]),
    new Room(1, 0, [1, 1, 0, 0]),
    new Room(2, 0, [1, 0, 0, 1]),
    new Room(3, 0, [1, 1, 0, 0]),

    new Room(0, 1, [0, 1, 0, 1]),
    new Room(1, 1, [0, 1, 1, 1], "start"),
    new Room(2, 1, [0, 1, 0, 1]),
    new Room(3, 1, [0, 1, 0, 1]),

    new Room(0, 2, [0, 0, 0, 1]),
    new Room(1, 2, [1, 1, 0, 0]),
    new Room(2, 2, [0, 1, 0, 1]),
    new Room(3, 2, [0, 1, 0, 1]),

    new Room(0, 3, [0, 1, 1, 1], "evil"),
    new Room(1, 3, [0, 0, 1, 1]),
    new Room(2, 3, [0, 1, 1, 0]),
    new Room(3, 3, [0, 1, 1, 1], "passage"),
  ];
}
