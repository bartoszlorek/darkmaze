import * as React from "react";
import { Keyboard, Player, PlayerStatus, VirtualJoystick } from "./core";

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
  playerStatus: PlayerStatus;
}>;

export function usePlayerKeyboard({ player, playerStatus }: PropsType) {
  const shouldBindKeyboard =
    playerStatus === "idle" ||
    playerStatus === "running" ||
    playerStatus === "turning";

  React.useEffect(() => {
    if (!shouldBindKeyboard) {
      return;
    }

    const keyboard = new Keyboard<PlayerMovementKeys>();
    const joystick = new VirtualJoystick().bind();

    joystick.subscribe("panUp", (pressed) => {
      if (pressed) {
        player.moveForward();
      } else {
        player.moveBackward();
      }
    });

    joystick.subscribe("panDown", (pressed) => {
      if (pressed) {
        player.moveBackward();
      } else {
        player.moveForward();
      }
    });

    joystick.subscribe("swipeLeft", () => {
      player.rotateBy(-90);
    });

    joystick.subscribe("swipeRight", () => {
      player.rotateBy(90);
    });

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
      joystick.destroy();
    };
  }, [player, shouldBindKeyboard]);
}
