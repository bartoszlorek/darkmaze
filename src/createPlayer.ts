import { Keyboard } from "./Keyboard";
import { Player } from "./Player";

type PlayerMovementKeys =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "w"
  | "s"
  | "a"
  | "d";

export function createPlayer(): [Player, () => void] {
  const player = new Player(1, 1, 0);
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

  const cleanup = () => {
    keyboard.destroy();
  };

  return [player, cleanup];
}
