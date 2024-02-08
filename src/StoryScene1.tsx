import * as React from "react";
import { ANTICIPATION_TIME } from "./consts";
import { Level, Room } from "./core";
import { Compass, Dialog } from "./components";
import { createPlayer } from "./createPlayer";
import { dialogues } from "./dialogues";
import { MainStageLayer } from "./MainStageLayer";
import { useAppContext } from "./context";
import { useDialog } from "./useDialog";
import { useGameLoop } from "./useGameLoop";
import { useInstance } from "./useInstance";
import { usePlayerKeyboard } from "./usePlayerKeyboard";
import { usePlayerStatus } from "./usePlayerStatus";

type PropsType = Readonly<{
  nextScene: () => void;
}>;

export function StoryScene1({ nextScene }: PropsType) {
  const { app } = useAppContext();
  const level = useInstance(() => new Level(createRooms()));
  const player = useInstance(() => createPlayer(level, false));
  const playerStatus = usePlayerStatus({ player });
  const [dialog, setDialog] = useDialog(dialogues);

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
        level.emit("reveal", undefined);
        player.setStatus("exiting");
        setTimeout(nextScene, ANTICIPATION_TIME);
      }
    });

    setDialog("entry");
  }, [player, level, nextScene, setDialog]);

  return (
    <>
      <MainStageLayer player={player} level={level} />
      <Compass player={player} level={level} />
      {dialog !== null && <Dialog value={dialog} />}
    </>
  );
}

function createRooms(): Room[] {
  return [
    new Room(0, 0).setWallsByBit(1, 1, 0, 0),
    new Room(1, 0).setWallsByBit(1, 0, 0, 1),
    new Room(2, 0).setWallsByBit(1, 0, 1, 0),

    new Room(0, 1).setWallsByBit(0, 1, 0, 1),
    new Room(1, 1, "start").setWallsByBit(1, 0, 1, 1),
    new Room(2, 1).setWallsByBit(0, 1, 1, 0),

    new Room(0, 2, "passage").setWallsByBit(1, 1, 0, 1),
    new Room(1, 2).setWallsByBit(1, 0, 0, 1),
    new Room(2, 2).setWallsByBit(0, 0, 1, 1),
  ];
}
