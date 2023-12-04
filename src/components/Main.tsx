import "./Main.module.scss";
import * as React from "react";
import * as PIXI from "pixi.js";
import { GameViewLayer } from "./GameViewLayer";
import { Logger } from "./Logger";
import { drawLevel } from "./drawLevel";
import { drawPlayer } from "./drawPlayer";
import { useLevel } from "./useLevel";
import { usePlayer } from "./usePlayer";

const GRID_SIZE = 64;

type PropsType = Readonly<{
  app: PIXI.Application;
}>;

export function Main({ app }: PropsType) {
  const player = usePlayer();
  const level = useLevel();

  const [visible, setVisible] = React.useState(true);
  const handleToggle = () => setVisible((prev) => !prev);

  React.useEffect(() => {
    const handleGameLoop = (deltaTime: number) => {
      const currentRoom = level.rooms.find((room) =>
        room.contains(player.x, player.y)
      );

      if (currentRoom === undefined) {
        throw new Error("the player is outside the maze");
      }

      player.update(deltaTime, currentRoom);
    };

    app.ticker.add(handleGameLoop);

    return () => {
      app.ticker.remove(handleGameLoop);
    };
  }, [app, player, level]);

  console.log("--render");

  return (
    <>
      {visible && (
        <GameViewLayer
          app={app}
          onMount={(layer) => {
            const parent = new PIXI.Container();
            parent.x = 200;
            parent.y = 200;

            drawLevel({
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
              redrawPlayer,
            };
          }}
          onUpdate={(deltaTime, context) => {
            context.redrawPlayer();
          }}
        />
      )}

      <Logger player={player} />
      <button
        onClick={handleToggle}
        style={{ position: "fixed", right: 24, bottom: 24 }}
      >
        toggle view
      </button>
    </>
  );
}
