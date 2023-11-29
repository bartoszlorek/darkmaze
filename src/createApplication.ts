import * as PIXI from "pixi.js";

export function createApplication() {
  const app = new PIXI.Application({
    background: "#232228",
    resizeTo: window,
  });

  document.body.appendChild(app.view as HTMLCanvasElement);
  return app;
}
