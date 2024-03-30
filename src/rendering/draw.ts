import * as PIXI from "pixi.js";

export type DrawFunctionArgs<T extends Record<string, unknown>> = T & {
  parent: PIXI.Container;
};

export type DrawFunction<
  T extends Record<string, unknown>,
  P extends unknown[] = []
> = (args: DrawFunctionArgs<T>) => [RedrawFunction<P>, CleanupFunction];

export type RedrawFunction<P extends unknown[]> = (...args: P) => void;

export type CleanupFunction = () => void;

export const noop = () => undefined;
