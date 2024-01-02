import * as PIXI from "pixi.js";

const textStyleOptions = {
  fontFamily: "Arial",
  fill: 0xffffff,
} as const;

type PrintFunction = (
  value: string | number,
  x: number,
  y: number,
  fontSize?: number
) => void;

type ReturnType = [container: PIXI.Container, print: PrintFunction];

export function createDebugger(): ReturnType {
  const container = new PIXI.Container();
  const refs = new Map<string, PIXI.Text>();

  const print: PrintFunction = (value, x, y, fontSize = 16) => {
    const key = `${x}-${y}`;

    let element = refs.get(key);
    if (element === undefined) {
      element = new PIXI.Text(0, textStyleOptions);
      element.x = x;
      element.y = y;
      element.anchor.set(0.5);

      container.addChild(element);
      refs.set(key, element);
    }

    element.style.fontSize = fontSize;
    element.text = value;
  };

  return [container, print];
}
