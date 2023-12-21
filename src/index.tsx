import * as PIXI from "pixi.js";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { definedAssets } from "./assets";
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

PIXI.Assets.load(definedAssets).then((textures) => {
  createRoot(root).render(
    <HashRouter>
      <AppContextProvider value={{ app, textures }}>
        <MainScene />
      </AppContextProvider>
    </HashRouter>
  );
});
