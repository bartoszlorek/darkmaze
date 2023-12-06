import * as PIXI from "pixi.js";
import { createRoot } from "react-dom/client";
import { Main } from "./scenes/Main";

const view = document.getElementById("view") as HTMLCanvasElement;
const root = document.getElementById("root") as HTMLDivElement;
const app = new PIXI.Application({
  backgroundAlpha: 0,
  resizeTo: window,
  view,
});

createRoot(root).render(<Main app={app} />);
