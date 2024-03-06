import * as PIXI from "pixi.js";

export function createAnimationFrames<T extends PIXI.ISpritesheetData>(
  spritesheet: PIXI.Spritesheet<T>
) {
  const animationNames = Object.keys(
    spritesheet.animations
  ) as (keyof T["animations"])[];

  return Object.fromEntries(
    animationNames.map((name) => {
      const firstFrameName = `${name as string}0`;

      // @ts-expect-error the duration should exists in the aseprite file
      const time = spritesheet.data.frames[firstFrameName].duration;
      const frames: PIXI.FrameObject[] = spritesheet.animations[name].map(
        (texture) => ({ texture, time })
      );

      return [name, frames];
    })
  ) as Record<keyof T["animations"], PIXI.FrameObject[]>;
}
