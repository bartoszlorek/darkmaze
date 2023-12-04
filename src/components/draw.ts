import * as PIXI from "pixi.js";

export type DrawFunctionArgs<T extends Record<string, unknown>> = T & {
  parent: PIXI.Container;
};

export type DrawFunction<T extends Record<string, unknown>> = (
  args: DrawFunctionArgs<T>
) => RedrawFunction;

export type RedrawFunction = () => void;
