import * as React from "react";
import * as PIXI from "pixi.js";
import type { LoadedSpritesheets } from "./assets";
import type { DEBUG_MODE } from "./debug";

export interface AppContextValue {
  app: PIXI.Application;
  sprites: LoadedSpritesheets;
  debug: DEBUG_MODE;
}

type PropsType = Readonly<{
  value: AppContextValue;
  children: React.ReactNode;
}>;

const AppContext = React.createContext<AppContextValue | null>(null);
export function AppContextProvider({ value, children }: PropsType) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const contextValue = React.useContext(AppContext);
  if (!contextValue) {
    throw new Error("no application context provided");
  }

  return contextValue;
}
