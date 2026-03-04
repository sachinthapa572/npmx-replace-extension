import { Glob } from "bun";
import sharp from "sharp";

const ICONS_DIR = "./icons";
const glob = new Glob("*.png");

const files = [];
for await (const file of glob.scan(ICONS_DIR)) {
  const name = file.replace("./icons/", "");
  if (!name.includes("disable-")) {
    files.push(name);
  }
}

for (const file of files) {
  const inputPath = `${ICONS_DIR}/${file}`;
  const sizePart = file.replace("favicon-", "").replace(".png", "");
  const outputName = `favicon-disable-${sizePart}.png`;
  const outputPath = `${ICONS_DIR}/${outputName}`;

  const inputBuffer = await Bun.file(inputPath).arrayBuffer();
  await sharp(Buffer.from(inputBuffer)).grayscale().toFile(outputPath);

  console.log(`Created: ${outputName}`);
}

console.log(`\nDone! Converted ${files.length} images.`);
