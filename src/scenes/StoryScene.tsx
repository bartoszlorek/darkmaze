import * as React from "react";
import * as PIXI from "pixi.js";
import { useNavigate } from "react-router-dom";
import { Compass, PathLights } from "../components";
import { Level } from "../Level";
import { Player } from "../Player";
import { Room } from "../Room";
import { MainStageLayer } from "./MainStageLayer";
import { useInstance } from "./useInstance";
import { useKeyboard } from "./useKeyboard";

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function StoryScene({ app }: PropsType) {
  const player = useInstance(() => new Player(1, 1, 0));
  const level = useInstance(() => new Level(generateRooms()));

  const navigate = useNavigate();
  const handleEscape = React.useCallback(() => navigate("/"), [navigate]);

  useKeyboard({
    player,
    onEscape: handleEscape,
  });

  React.useEffect(() => {
    level.subscribe("room_enter", ({ room }) => {
      const adjacentRooms = level.getAdjacentRooms(room);
      console.log({ adjacentRooms });
    });

    const mainGameLoop = (deltaTime: number) => {
      const currentRoom = level.updateCurrentRoom(player);
      player.update(deltaTime, currentRoom);
    };

    app.ticker.add(mainGameLoop);

    return () => {
      app.ticker.remove(mainGameLoop);
    };
  }, [app, level, player]);

  return (
    <>
      <MainStageLayer app={app} player={player} level={level} />
      <PathLights player={player} />
      <Compass player={player} />
    </>
  );
}

function generateRooms(): Room[] {
  return [
    new Room(0, 0, [1, 0, 0, 1]),
    new Room(1, 0, [1, 0, 1, 0]),
    new Room(2, 0, [1, 1, 0, 0]),

    new Room(0, 1, [0, 0, 1, 1]),
    new Room(1, 1, [1, 1, 1, 0]),
    new Room(2, 1, [0, 1, 0, 1]),

    new Room(0, 2, [1, 0, 1, 1]),
    new Room(1, 2, [1, 0, 1, 0]),
    new Room(2, 2, [0, 1, 1, 0]),
  ];
}
