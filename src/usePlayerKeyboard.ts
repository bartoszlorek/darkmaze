import * as React from "react";
import { Keyboard, Player, PlayerStatus, VirtualJoystick } from "./core";
import { dispatchKeyboardEvent } from "./helpers";

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
    const joystick = new PlayerVirtualJoystick();

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

class PlayerVirtualJoystick extends VirtualJoystick {
  protected pressed: Set<PlayerMovementKeys> = new Set();

  constructor() {
    super();
    this.bind();
  }

  onChangeUp() {
    dispatchKeyboardEvent<PlayerMovementKeys>("keydown", "ArrowUp");
    this.pressed.add("ArrowUp");
  }

  onChangeDown() {
    dispatchKeyboardEvent<PlayerMovementKeys>("keydown", "ArrowDown");
    this.pressed.add("ArrowDown");
  }

  onChangeLeft() {
    dispatchKeyboardEvent<PlayerMovementKeys>("keypress", "ArrowLeft");
  }

  onChangeRight() {
    dispatchKeyboardEvent<PlayerMovementKeys>("keypress", "ArrowRight");
  }

  onEnd() {
    for (const key of this.pressed) {
      dispatchKeyboardEvent<PlayerMovementKeys>("keyup", key);
    }
    this.pressed.clear();
  }
}
