import * as React from "react";
import { Keyboard } from "../Keyboard";
import type { Player } from "../Player";

type GeneralKeys = "Escape";

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
  onEscape?: () => void;
}>;

export function useKeyboard({ player, onEscape }: PropsType) {
  React.useEffect(() => {
    const keyboard = new Keyboard<PlayerMovementKeys | GeneralKeys>();

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

    if (onEscape) {
      keyboard.on(["Escape"], (pressed) => {
        if (pressed) {
          onEscape();
        }
      });
    }

    return () => {
      keyboard.destroy();
    };
  }, [player, onEscape]);
}
