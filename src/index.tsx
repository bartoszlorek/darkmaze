import * as PIXI from "pixi.js";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { loadAssets } from "./assets";
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
  // setting the initial width and height fixes auto-resize bug
  // https://www.html5gamedevs.com/topic/22692-mobile-device-resolution-issue/
  width: 100,
  height: 100,
});

const debugMode = getDebugMode();

loadAssets().then((assets) => {
  createRoot(root).render(
    <HashRouter>
      <AppContextProvider value={{ app, assets, debugMode }}>
        <MainScene />
      </AppContextProvider>
    </HashRouter>
  );
});
