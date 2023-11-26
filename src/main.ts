import * as PIXI from "pixi.js";
import { CELL_SIZE, CELL_HALF } from "./consts";
import { createApplication } from "./application";
import { createTicker } from "./ticker";
import { Keyboard } from "./Keyboard";
import { MazeFragment } from "./MazeFragment";
import { Player } from "./Player";

// setup
const logs = document.querySelector("#logs") as HTMLElement;
const app = createApplication();
const keyboard = new Keyboard<
  "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "w" | "s" | "a" | "d"
>();

// entities
const player = new Player(1, 1, 0);
const fragments = [
  new MazeFragment(0, 0, [1, 0, 0, 1]),
  new MazeFragment(1, 0, [1, 0, 1, 0]),
  new MazeFragment(2, 0, [1, 1, 0, 0]),

  new MazeFragment(0, 1, [0, 0, 1, 1]),
  new MazeFragment(1, 1, [1, 1, 1, 0]),
  new MazeFragment(2, 1, [0, 1, 0, 1]),

  new MazeFragment(0, 2, [1, 0, 1, 1]),
  new MazeFragment(1, 2, [1, 0, 1, 0]),
  new MazeFragment(2, 2, [0, 1, 1, 0]),
];

// rendering
const bunny = PIXI.Sprite.from("https://pixijs.com/assets/bunny.png");
bunny.anchor.set(0.5);

const graphics = new PIXI.Graphics();
graphics.lineStyle(4, "#5f5854");
fragments.forEach((cell) => {
  const left = cell.x * CELL_SIZE;
  const top = cell.y * CELL_SIZE;
  const right = left + CELL_SIZE;
  const bottom = top + CELL_SIZE;

  if (cell.walls[0]) {
    graphics.moveTo(left, top);
    graphics.lineTo(right, top);
  }

  if (cell.walls[1]) {
    graphics.moveTo(right, top);
    graphics.lineTo(right, bottom);
  }

  if (cell.walls[2]) {
    graphics.moveTo(left, bottom);
    graphics.lineTo(right, bottom);
  }

  if (cell.walls[3]) {
    graphics.moveTo(left, bottom);
    graphics.lineTo(left, top);
  }
});

const formatLogs = (props: {
  player: Player;
  closestPathAngle?: number;
  currentFragment: MazeFragment;
}) =>
  `
player_angle: ${props.player.angle}
player_x: ${props.player.x}
player_y: ${props.player.y}
closest_path_angle: ${props.closestPathAngle}
current_walls: ${props.currentFragment.walls}

`.trim();

const ticker = createTicker((deltaTime) => {
  const currentFragment = fragments.find((c) => c.contains(player.x, player.y));
  if (currentFragment === undefined) {
    throw new Error("the player is outside the maze");
  }

  const closestPathAngle = currentFragment.closestOpenWallAngle(player.angle);
  if (closestPathAngle === undefined) {
    throw new Error("the current cell has no way out");
  }

  logs.textContent = formatLogs({
    player,
    closestPathAngle,
    currentFragment,
  });

  // updating
  player.update(currentFragment);
  bunny.x = player.x * CELL_SIZE + CELL_HALF;
  bunny.y = player.y * CELL_SIZE + CELL_HALF;
  bunny.angle = player.angle;
});

app.stage.x = CELL_SIZE;
app.stage.y = CELL_SIZE;
app.stage.addChild(graphics);
app.stage.addChild(bunny);
app.ticker.add(ticker);

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
