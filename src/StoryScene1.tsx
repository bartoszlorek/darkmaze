import * as React from "react";
import * as PIXI from "pixi.js";
import { Compass, PathLights } from "./components";
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
}>;

export function StoryScene1({ app, nextScene }: PropsType) {
  const player = useInstance(() => new Player(1, 1, 0));
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
      if (room.type === "passage") {
        player.setStatus("exiting");
        setTimeout(nextScene, ANTICIPATION_TIME);
      }
    });
  }, [player, level, nextScene]);

  return (
    <>
      <MainStageLayer app={app} player={player} level={level} />
      <PathLights player={player} />
      <Compass player={player} level={level} />
    </>
  );
}

function createRooms(): Room[] {
  return [
    new Room(0, 0, [1, 0, 0, 1]),
    new Room(1, 0, [1, 0, 1, 0]),
    new Room(2, 0, [1, 1, 0, 0]),

    new Room(0, 1, [0, 0, 1, 1]),
    new Room(1, 1, [1, 1, 1, 0]),
    new Room(2, 1, [0, 1, 0, 1]),

    new Room(0, 2, [1, 0, 1, 1], "passage"),
    new Room(1, 2, [1, 0, 1, 0]),
    new Room(2, 2, [0, 1, 1, 0]),
  ];
}
