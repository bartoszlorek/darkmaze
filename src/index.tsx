import * as PIXI from "pixi.js";
import { createRoot } from "react-dom/client";
import { MainScene } from "./MainScene";

const view = document.getElementById("view") as HTMLCanvasElement;
const root = document.getElementById("root") as HTMLDivElement;
const app = new PIXI.Application({
  backgroundAlpha: 0,
  resizeTo: window,
  view,
});

createRoot(root).render(<MainScene app={app} />);
