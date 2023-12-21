import * as PIXI from "pixi.js";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { loadSpritesheets } from "./assets";
import { AppContextProvider } from "./context";
import { MainScene } from "./MainScene";

const view = document.getElementById("view") as HTMLCanvasElement;
const root = document.getElementById("root") as HTMLDivElement;

const app = new PIXI.Application({
  backgroundAlpha: 0,
  antialias: false,
  resizeTo: window,
  view,
});

loadSpritesheets().then((sprites) => {
  createRoot(root).render(
    <HashRouter>
      <AppContextProvider value={{ app, sprites }}>
        <MainScene />
      </AppContextProvider>
    </HashRouter>
  );
});
