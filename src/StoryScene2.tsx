import * as React from "react";
import { ANTICIPATION_TIME, TILE_SIZE } from "./consts";
import { Level, Room } from "./core";
import { getMargin } from "./margin";
import {
  ActionScreen,
  Button,
  Dialog,
  InfoPanel,
  InfoPanelElement,
} from "./components";
import { createPlayer } from "./createPlayer";
import { dialogues } from "./dialogues";
import { MainStageLayer } from "./MainStageLayer";
import { useAppContext } from "./context";
import { useDialog } from "./useDialog";
import { useGameLoop } from "./useGameLoop";
import { useInstance } from "./useInstance";
import { usePlayerKeyboard } from "./usePlayerKeyboard";
import { usePlayerStatus } from "./usePlayerStatus";
import { MenuState } from "./useMenu";

type PropsType = Readonly<{
  menu: MenuState;
  nextScene: () => void;
  resetScene: () => void;
}>;

export function StoryScene2({ menu, nextScene, resetScene }: PropsType) {
  const { app } = useAppContext();
  const level = useInstance(() => createLevel());
  const [dialog, setDialog] = useDialog(dialogues);

  const player = useInstance(() => createPlayer(level, false));
  const playerStatus = usePlayerStatus({ player });
  const playerDiedOrWon = playerStatus === "died" || playerStatus === "won";

  usePlayerKeyboard({
    player,
    playerStatus,
    menu,
  });

  useGameLoop({
    app,
    player,
    level,
  });

  React.useEffect(() => {
    level.subscribe("room_enter", ({ room }) => {
      switch (room.type) {
        case "evil": {
          player.setStatus("paused");
          setTimeout(() => player.setStatus("died"), ANTICIPATION_TIME);
          break;
        }

        case "passage": {
          player.setStatus("exiting");
          setTimeout(nextScene, ANTICIPATION_TIME);
          break;
        }

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

      <InfoPanel tileSize={TILE_SIZE} getMargin={getMargin}>
        {!(menu.isOpen || playerDiedOrWon) && (
          <InfoPanelElement onClick={menu.open}>menu</InfoPanelElement>
        )}
      </InfoPanel>

      {dialog !== null && <Dialog value={dialog} />}
      {playerStatus === "died" && (
        <ActionScreen title="you died" titleColor="red">
          <Button onClick={resetScene}>restart</Button>
        </ActionScreen>
      )}
    </>
  );
}

function createLevel(): Level {
  const rooms = [
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

  return new Level(rooms).updateCorrectPaths();
}
