const fs = require("fs");
const path = require("path");

const [, , assetsPath, scale = "1"] = process.argv;

fs.readdir(assetsPath, (err, files) => {
  if (err) {
    throw new Error(err);
  }

  files.forEach((filename) => {
    if (path.extname(filename) !== ".json") {
      return;
    }

    const filepath = path.join(assetsPath, filename);
    fs.readFile(filepath, "utf8", (err, rawData) => {
      if (err) {
        throw new Error(err);
      }

      const parsedData = JSON.parse(rawData);
      const outputData = buildAnimationsFromFrameTags(
        buildFramesFromSlices(parsedData)
      );

      outputData.meta.scale = scale;

      fs.writeFile(filepath, JSON.stringify(outputData), "utf8", (err) => {
        if (err) {
          throw new Error(err);
        }

        console.log(`- ${filename} file has been updated`);
      });
    });
  });
});

function buildAnimationsFromFrameTags(parsedData) {
  const animations = {};

  parsedData.meta.frameTags.forEach((tag) => {
    animations[tag.name] = Array.from(
      { length: tag.to - tag.from + 1 },
      (_, i) => `${tag.name}${i}`
    );
  });

  return { ...parsedData, animations };
}

function buildFramesFromSlices(parsedData) {
  const frames = {};

  parsedData.meta.slices?.forEach((slice) => {
    frames[slice.name] = {
      frame: slice.keys[0].bounds,
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 24, h: 24 },
      sourceSize: { w: 24, h: 24 },
      duration: 100,
    };
  });

  return {
    ...parsedData,
    frames: {
      ...parsedData.frames,
      ...frames,
    },
  };
}
