import * as PIXI from "pixi.js";
import { createApplication } from "./createApplication";
import { createLevel } from "./createLevel";
import { createLevelRenderer } from "./createLevelRenderer";
import { createPlayer } from "./createPlayer";

const app = createApplication();
const [player] = createPlayer();
const level = createLevel();

const logs = document.querySelector("#logs") as HTMLElement;
const log = (data: string) => {
  logs.textContent = data.replace(/\n\u0020+/gm, "\n").trim();
};

app.ticker.add(() => {
  const currentRoom = level.rooms.find((a) => a.contains(player.x, player.y));
  if (currentRoom === undefined) {
    throw new Error("the player is outside the maze");
  }

  const closestPathAngle = currentRoom.closestOpenWallAngle(player.angle);
  if (closestPathAngle === undefined) {
    throw new Error("the current cell has no way out");
  }

  log(`
  player_angle: ${player.angle}
  player_x: ${player.x}
  player_y: ${player.y}

  closest_path_angle: ${closestPathAngle}
  current_walls: ${currentRoom.walls}
  `);

  player.update(currentRoom);
});

const renderer = createLevelRenderer({ player, level });
app.stage.addChild(renderer.container);
app.ticker.add(renderer.update);
