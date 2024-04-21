import * as PIXI from "pixi.js";
import { Player } from "../core";
import { radians, subscribeResize, Camera3d, Rectangle3d } from "../helpers";
import { DrawFunction } from "./draw";

const outlineStyle = {
  width: 2,
  color: 0x313e57,
};

export const drawLevel3d: DrawFunction<{
  player: Player;
}> = ({ parent, player }) => {
  const camera = new Camera3d();
  parent.addChild(camera);

  const ceiling = new Rectangle3d();
  const ground = new Rectangle3d();

  const resize = () => {
    camera.x = window.innerWidth / 2;
    camera.y = window.innerHeight / 2;

    const wallWidth = Math.min(window.innerWidth, window.innerHeight) * 0.4;
    const wallHeight = window.innerHeight * 0.4;
    camera.setPerspective(wallWidth, 0, 1000);

    ceiling.size = wallWidth;
    ceiling.origin[1] = -wallHeight / 2;
    ceiling.origin[2] = -wallWidth / 2;

    ground.size = wallWidth;
    ground.origin[1] = wallHeight / 2;
    ground.origin[2] = -wallWidth / 2;
  };

  const unsubscribeResize = subscribeResize(resize);
  resize();

  return [
    () => {
      camera.clear();
      camera.lineStyle(outlineStyle);

      ceiling.radians = ground.radians = -radians(player.angle);
      ceiling.drawPoints(camera);
      ground.drawPoints(camera);

      if (ground.a[2] > -ground.size) {
        camera.moveTo3d(ceiling.a[0], ceiling.a[1], ceiling.a[2]);
        camera.lineTo3d(ground.a[0], ground.a[1], ground.a[2]);
      }
      if (ground.b[2] > -ground.size) {
        camera.moveTo3d(ceiling.b[0], ceiling.b[1], ceiling.b[2]);
        camera.lineTo3d(ground.b[0], ground.b[1], ground.b[2]);
      }
      if (ground.c[2] > -ground.size) {
        camera.moveTo3d(ceiling.c[0], ceiling.c[1], ceiling.c[2]);
        camera.lineTo3d(ground.c[0], ground.c[1], ground.c[2]);
      }
      if (ground.d[2] > -ground.size) {
        camera.moveTo3d(ceiling.d[0], ceiling.d[1], ceiling.d[2]);
        camera.lineTo3d(ground.d[0], ground.d[1], ground.d[2]);
      }
    },
    () => {
      unsubscribeResize();
    },
  ];
};
