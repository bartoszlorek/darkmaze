import * as React from "react";
import { Keyboard } from "./engine";
import type { Player } from "./Player";

type PlayerMovementKeys =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "w"
  | "s"
  | "a"
  | "d";

type PropsType = Readonly<{
  player: Player;
  paused: boolean;
}>;

export function usePlayerKeyboard({ player, paused }: PropsType) {
  React.useEffect(() => {
    if (paused) {
      player.resetMovement();
      return;
    }

    const keyboard = new Keyboard<PlayerMovementKeys>();

    keyboard.on(["ArrowLeft", "a"], (pressed) => {
      if (pressed) {
        player.turnLeft();
      } else {
        player.turnRight();
      }
    });

    keyboard.on(["ArrowRight", "d"], (pressed) => {
      if (pressed) {
        player.turnRight();
      } else {
        player.turnLeft();
      }
    });

    keyboard.on(["ArrowUp", "w"], (pressed) => {
      if (pressed) {
        player.moveForward();
      } else {
        player.moveBackward();
      }
    });

    keyboard.on(["ArrowDown", "s"], (pressed) => {
      if (pressed) {
        player.moveBackward();
      } else {
        player.moveForward();
      }
    });

    return () => {
      keyboard.destroy();
    };
  }, [player, paused]);
}
