import * as PIXI from "pixi.js";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { loadSpritesheets } from "./assets";
import { getDebugMode } from "./debug";
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

const debugMode = getDebugMode();

loadSpritesheets().then((sprites) => {
  createRoot(root).render(
    <HashRouter>
      <AppContextProvider value={{ app, sprites, debugMode }}>
        <MainScene />
      </AppContextProvider>
    </HashRouter>
  );
});
