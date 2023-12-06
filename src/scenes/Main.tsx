import * as React from "react";
import * as PIXI from "pixi.js";
import { Compass, GameViewLayer, Logger } from "../components";
import { Level } from "../Level";
import { Player } from "../Player";
import { Room } from "../Room";
import { drawLevel } from "./drawLevel";
import { drawPlayer } from "./drawPlayer";
import { useInstance } from "./useInstance";
import { useKeyboard } from "./useKeyboard";

const GRID_SIZE = 48;

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function Main({ app }: PropsType) {
  console.log("--main");

  const player = useInstance(() => new Player(1, 1, 0));
  const level = useInstance(() => new Level(generateRooms()));

  useKeyboard({
    player,
  });

  React.useEffect(() => {
    const mainGameLoop = (deltaTime: number) => {
      const currentRoom = level.findCurrentRoom(player);
      player.update(deltaTime, currentRoom);
    };

    app.ticker.add(mainGameLoop);

    return () => {
      app.ticker.remove(mainGameLoop);
    };
  }, [app, level, player]);

  return (
    <>
      <GameViewLayer
        app={app}
        onMount={(layer) => {
          const parent = new PIXI.Container();
          const levelMiddle = (level.dimension * GRID_SIZE) / 2;
          parent.x = window.innerWidth / 2 - levelMiddle;
          parent.y = window.innerHeight / 2 - levelMiddle;
          layer.addChild(parent);

          const redrawLevel = drawLevel({
            parent,
            level,
            gridSize: GRID_SIZE,
          });

          const redrawPlayer = drawPlayer({
            parent,
            player,
            gridSize: GRID_SIZE,
          });

          return {
            redrawLevel,
            redrawPlayer,
          };
        }}
        onUpdate={(deltaTime, context) => {
          context.redrawLevel();
          context.redrawPlayer();
        }}
      />
      <Logger player={player} />
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
