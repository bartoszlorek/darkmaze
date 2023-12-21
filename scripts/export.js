const { exec } = require("child_process");

exec(
  "aseprite -b src/assets/player.aseprite --scale 2 --sheet player.png --data player.json"
);
