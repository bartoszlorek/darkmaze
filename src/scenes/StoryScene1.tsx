import * as React from "react";
import * as PIXI from "pixi.js";
import { Compass, PathLights } from "../components";
import { Level } from "../Level";
import { Player } from "../Player";
import { Room } from "../Room";
import { MainStageLayer } from "./MainStageLayer";
import { useInstance } from "./useInstance";
import { usePlayerKeyboard } from "./usePlayerKeyboard";

type PropsType = Readonly<{
  app: PIXI.Application;
  nextScene: () => void;
}>;

export function StoryScene1({ app, nextScene }: PropsType) {
  const [paused, setPaused] = React.useState(false);
  const player = useInstance(() => new Player(1, 1, 0));
  const level = useInstance(() => new Level(createRooms()));

  usePlayerKeyboard({
    player,
    paused,
  });

  React.useEffect(() => {
    level.subscribe("room_enter", ({ room }) => {
      if (room.type === "passage") {
        nextScene();
        setPaused(true);
      }
    });

    const mainTick = (deltaTime: number) => {
      const currentRoom = level.updateCurrentRoom(player);
      player.update(deltaTime, currentRoom);
    };

    app.ticker.add(mainTick);

    return () => {
      app.ticker.remove(mainTick);
    };
  }, [app, player, level, nextScene]);

  return (
    <>
      <MainStageLayer app={app} player={player} level={level} />
      <PathLights player={player} />
      <Compass player={player} />
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