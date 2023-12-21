const fs = require("fs");
const path = require("path");

const assetsPath = "./src/assets";
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
      const outputData = buildAnimations(parsedData);

      fs.writeFile(filepath, JSON.stringify(outputData), "utf8", (err) => {
        if (err) {
          throw new Error(err);
        }

        console.log(`- ${filename} file has been updated`);
      });
    });
  });
});

function buildAnimations(parsedData) {
  const { frameTags } = parsedData.meta;
  if (!frameTags) {
    throw new Error("missing frame tags");
  }

  const animations = {};
  frameTags.forEach((tag) => {
    animations[tag.name] = Array.from(
      { length: tag.to - tag.from + 1 },
      (_, i) => `${tag.name}${i}`
    );
  });

  return { ...parsedData, animations };
}
