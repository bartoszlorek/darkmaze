import * as React from "react";
import * as PIXI from "pixi.js";
import { useNavigate } from "react-router-dom";
import { subscribeResize } from "../utils";
import { Compass, GameViewLayer, PathLights } from "../components";
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

export function StoryScene({ app }: PropsType) {
  console.log("--story");

  const player = useInstance(() => new Player(0, 1, 0));
  const level = useInstance(() => new Level(generateRooms()));

  const navigate = useNavigate();
  const handleEscape = React.useCallback(() => navigate("/"), [navigate]);

  useKeyboard({
    player,
    onEscape: handleEscape,
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
          const centerParent = () => {
            const levelMiddle = (level.dimension * GRID_SIZE) / 2;
            parent.x = window.innerWidth / 2 - levelMiddle;
            parent.y = window.innerHeight / 2 - levelMiddle;
          };

          const unsubscribeResize = subscribeResize(centerParent);
          centerParent();

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

          layer.addChild(parent);

          return {
            redrawLevel,
            redrawPlayer,
            unsubscribeResize,
          };
        }}
        onUpdate={(_, ctx) => {
          ctx.redrawLevel();
          ctx.redrawPlayer();
        }}
        onUnmount={(_, ctx) => {
          ctx.unsubscribeResize();
        }}
      />
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
