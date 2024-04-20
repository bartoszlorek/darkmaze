import * as PIXI from "pixi.js";
import * as PIXIProjection from "pixi-projection";
import { LoadedAssets } from "../assets";
import { Player } from "../core";
import { radians, subscribeResize } from "../helpers";
import { DrawFunction } from "./draw";

const WALL_SIZE = 192;

export const drawLevel3d: DrawFunction<{
  player: Player;
  assets: LoadedAssets;
  app: PIXI.Application;
}> = ({ parent, player, assets, app }) => {
  const camera = new PIXIProjection.Camera3d();
  const cameraScale3d = new PIXIProjection.Point3d(1, 1, 1);
  camera.scale3d = cameraScale3d;
  camera.position3d.z = WALL_SIZE * 2;
  camera.setPlanes(WALL_SIZE * 2.5, -WALL_SIZE * 2, WALL_SIZE * 2);

  const renderTexture = PIXI.RenderTexture.create();
  const renderSprite = new PIXI.Sprite(renderTexture);
  parent.addChild(renderSprite);

  const resize = () => {
    const aspectRatio = window.innerWidth / window.innerHeight;
    const scaleFactor = 1 - Math.min(1, aspectRatio);
    cameraScale3d.x = 1 + scaleFactor * 4;
    cameraScale3d.y = 1 + scaleFactor * 4;
    camera.scale3d = cameraScale3d;

    // rendering camera3d to texture allows to apply 2d filters
    camera.position.set(window.innerWidth / 2, window.innerHeight / 2);
    renderTexture.resize(window.innerWidth, window.innerHeight);
  };

  const unsubscribeResize = subscribeResize(resize);
  resize();

  const wallFront = new PIXIProjection.Sprite3d(assets.walls_3d);
  wallFront.anchor.set(0.5);
  wallFront.position3d.z = WALL_SIZE / 2;

  const wallRight = new PIXIProjection.Sprite3d(assets.walls_3d);
  wallRight.anchor.set(0.5);
  wallRight.position3d.x = WALL_SIZE / 2;
  wallRight.euler.y = Math.PI / 2;

  const wallLeft = new PIXIProjection.Sprite3d(assets.walls_3d);
  wallLeft.anchor.set(0.5);
  wallLeft.position3d.x = -WALL_SIZE / 2;
  wallLeft.euler.y = -Math.PI / 2;

  const wallBack = new PIXIProjection.Sprite3d(assets.walls_3d);
  wallBack.anchor.set(0.5);
  wallBack.position3d.z = -WALL_SIZE / 2;
  wallBack.euler.y = Math.PI;

  const container = new PIXIProjection.Container3d();
  container.addChild(wallFront);
  container.addChild(wallRight);
  container.addChild(wallLeft);
  container.addChild(wallBack);
  camera.addChild(container);

  return [
    () => {
      container.euler.y = -radians(player.angle);
      app.renderer.render(camera, { renderTexture });
    },
    () => {
      unsubscribeResize();
    },
  ];
};
