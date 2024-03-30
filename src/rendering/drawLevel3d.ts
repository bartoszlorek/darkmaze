import * as PIXI from "pixi.js";
import * as PIXIProjection from "pixi-projection";
import { LoadedAssets } from "../assets";
import { Level, Player } from "../core";
import { radians, subscribeResize } from "../helpers";
import { DrawFunction } from "./draw";

const WALL_SIZE = 200;

export const drawLevel3d: DrawFunction<{
  level: Level;
  player: Player;
  assets: LoadedAssets;
  app: PIXI.Application;
}> = ({ parent, level, player, assets, app }) => {
  const camera = new PIXIProjection.Camera3d();
  camera.position3d.z = WALL_SIZE * 2;
  camera.setPlanes(WALL_SIZE * 2.5, -WALL_SIZE * 2, WALL_SIZE * 2);

  const renderTexture = PIXI.RenderTexture.create();
  const renderSprite = new PIXI.Sprite(renderTexture);
  parent.addChild(renderSprite);

  const resize = () => {
    camera.position.set(window.innerWidth / 2, window.innerHeight / 2);
    renderTexture.resize(window.innerWidth, window.innerHeight);
  };

  const unsubscribeResize = subscribeResize(resize);
  resize();

  const wallFront = new PIXIProjection.Sprite3d(assets.checker);
  wallFront.anchor.set(0.5);
  wallFront.position3d.z = WALL_SIZE / 2;

  const wallRight = new PIXIProjection.Sprite3d(assets.checker);
  wallRight.anchor.set(0.5);
  wallRight.position3d.x = WALL_SIZE / 2;
  wallRight.euler.y = Math.PI / 2;

  const wallLeft = new PIXIProjection.Sprite3d(assets.checker);
  wallLeft.anchor.set(0.5);
  wallLeft.position3d.x = -WALL_SIZE / 2;
  wallLeft.euler.y = -Math.PI / 2;

  const wallBack = new PIXIProjection.Sprite3d(assets.checker);
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
      const currentRoom = level.lastVisitedRoom;
      if (!currentRoom) {
        return;
      }

      container.euler.y = -radians(player.angle);
      app.renderer.render(camera, { renderTexture });
    },
    () => {
      unsubscribeResize();
    },
  ];
};
