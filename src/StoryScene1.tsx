import * as React from "react";
import * as PIXI from "pixi.js";
import { ANTICIPATION_TIME, DIALOGUES } from "./consts";
import { Compass, Dialog, PathLights } from "./components";
import { createPlayer } from "./createPlayer";
import { Level } from "./Level";
import { Room } from "./Room";
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
}>;

export function StoryScene1({ app, debug, nextScene }: PropsType) {
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
      if (room.type === "passage") {
        player.setStatus("exiting");
        setTimeout(nextScene, ANTICIPATION_TIME);
      }
    });

    setDialog("entry");
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
    </>
  );
}

function createRooms(): Room[] {
  return [
    new Room(0, 0, [1, 0, 0, 1]),
    new Room(1, 0, [1, 0, 1, 0]),
    new Room(2, 0, [1, 1, 0, 0]),

    new Room(0, 1, [0, 0, 1, 1]),
    new Room(1, 1, [1, 1, 1, 0], "start"),
    new Room(2, 1, [0, 1, 0, 1]),

    new Room(0, 2, [1, 0, 1, 1], "passage"),
    new Room(1, 2, [1, 0, 1, 0]),
    new Room(2, 2, [0, 1, 1, 0]),
  ];
}
