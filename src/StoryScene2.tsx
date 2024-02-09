import * as React from "react";
import { ANTICIPATION_TIME } from "./consts";
import { Level, Room } from "./core";
import { ActionScreen, Button, Dialog } from "./components";
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
  resetScene: () => void;
}>;

export function StoryScene2({ nextScene, resetScene }: PropsType) {
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
      switch (room.type) {
        case "evil":
          level.emit("reveal", undefined);
          player.setStatus("paused");
          setTimeout(() => player.setStatus("died"), ANTICIPATION_TIME);
          break;

        case "passage":
          level.emit("reveal", undefined);
          player.setStatus("exiting");
          setTimeout(nextScene, ANTICIPATION_TIME);
          break;

        default: {
          if (level.getConnectedRooms(room).some(Room.isEvil)) {
            setDialog("evil");
          }
        }
      }
    });
  }, [player, level, nextScene, setDialog]);

  return (
    <>
      <MainStageLayer player={player} level={level} />
      {dialog !== null && <Dialog value={dialog} />}
      {playerStatus === "died" && (
        <ActionScreen title="you died" titleColor="red">
          <Button onClick={resetScene}>restart</Button>
        </ActionScreen>
      )}
    </>
  );
}

function createRooms(): Room[] {
  return [
    new Room(0, 0).setWallsByBit(1, 1, 0, 0),
    new Room(1, 0).setWallsByBit(1, 0, 1, 0),
    new Room(2, 0).setWallsByBit(1, 1, 0, 0),
    new Room(3, 0).setWallsByBit(1, 0, 1, 0),

    new Room(0, 1).setWallsByBit(0, 1, 1, 0),
    new Room(1, 1, "start").setWallsByBit(0, 1, 1, 1),
    new Room(2, 1).setWallsByBit(0, 1, 1, 0),
    new Room(3, 1).setWallsByBit(0, 1, 1, 0),

    new Room(0, 2).setWallsByBit(0, 1, 0, 0),
    new Room(1, 2).setWallsByBit(1, 0, 1, 0),
    new Room(2, 2).setWallsByBit(0, 1, 1, 0),
    new Room(3, 2).setWallsByBit(0, 1, 1, 0),

    new Room(0, 3, "evil").setWallsByBit(0, 1, 1, 1),
    new Room(1, 3).setWallsByBit(0, 1, 0, 1),
    new Room(2, 3).setWallsByBit(0, 0, 1, 1),
    new Room(3, 3, "passage").setWallsByBit(0, 1, 1, 1),
  ];
}
