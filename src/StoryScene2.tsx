import * as React from "react";
import * as PIXI from "pixi.js";
import { Compass, DieScreen, PathLights } from "./components";
import { Level } from "./Level";
import { Player } from "./Player";
import { Room } from "./Room";
import { MainStageLayer } from "./MainStageLayer";
import { useGameLoop } from "./useGameLoop";
import { useInstance } from "./useInstance";
import { usePlayerKeyboard } from "./usePlayerKeyboard";

type PropsType = Readonly<{
  app: PIXI.Application;
  resetScene: () => void;
}>;

export function StoryScene2({ app, resetScene }: PropsType) {
  const [died, setDied] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const player = useInstance(() => new Player(1, 1, 0));
  const level = useInstance(() => new Level(createRooms()));

  usePlayerKeyboard({
    player,
    paused: paused || died,
  });

  useGameLoop({
    app,
    player,
    level,
  });

  React.useEffect(() => {
    level.subscribe("room_enter", ({ room }) => {
      if (room.type === "evil") {
        setDied(true);
        return;
      }

      const adjacentRooms = level.getAdjacentRooms(room);
      console.log({ adjacentRooms });
    });
  }, [level]);

  return (
    <>
      <MainStageLayer app={app} player={player} level={level} />
      <PathLights player={player} />
      <Compass player={player} />
      {died && <DieScreen onResetClick={resetScene} />}
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
    new Room(1, 1, [0, 1, 1, 1]),
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
