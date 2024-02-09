import * as PIXI from "pixi.js";

export class Camera {
  container: PIXI.Container;
  tileSize: number;

  constructor(container: PIXI.Container, tileSize: number) {
    this.container = container;
    this.tileSize = tileSize;
  }

  lookAt<T extends { x: number; y: number }>(obj: T) {
    const diffX = window.innerWidth / 2 - obj.x * this.tileSize;
    const diffY = window.innerHeight / 2 - obj.y * this.tileSize;
    this.container.x = Math.round(diffX - this.tileSize / 2);
    this.container.y = Math.round(diffY - this.tileSize / 2);
  }
}
