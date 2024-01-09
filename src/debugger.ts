import * as PIXI from "pixi.js";

const textStyleOptions = {
  fontFamily: "Arial",
  fill: 0xffffff,
} as const;

export function createDebugger() {
  const container = new PIXI.Container();
  const refs = new Map<string, PIXI.Text>();
  const used = new Set<string>();

  const print = (
    value: string | number,
    x: number,
    y: number,
    fontSize: number = 16
  ) => {
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
    used.add(key);
  };

  const afterAll = () => {
    for (const [key, text] of refs.entries()) {
      if (!used.has(key)) {
        text.destroy();
        refs.delete(key);
      }
    }
    used.clear();
  };

  return {
    layer: container,
    print,
    afterAll,
  };
}
