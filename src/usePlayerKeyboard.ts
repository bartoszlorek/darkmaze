import * as React from "react";
import { Keyboard, Player, PlayerStatus, VirtualJoystick } from "./core";
import { MenuState } from "./useMenu";

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
  menu: MenuState;
}>;

export function usePlayerKeyboard({ player, playerStatus, menu }: PropsType) {
  const shouldBindPlayer =
    (playerStatus === "idle" ||
      playerStatus === "running" ||
      playerStatus === "turning") &&
    menu.isOpen === false;

  const shouldBindMenu = !(playerStatus === "died" || playerStatus === "won");

  React.useEffect(() => {
    if (!shouldBindPlayer) {
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
  }, [player, shouldBindPlayer]);

  React.useEffect(() => {
    if (!shouldBindMenu) {
      return;
    }

    const keyboard = new Keyboard<"Escape">();
    keyboard.on(["Escape"], (pressed) => {
      if (pressed) menu.toggle();
    });

    return () => {
      keyboard.destroy();
    };
  }, [menu, shouldBindMenu]);
}
