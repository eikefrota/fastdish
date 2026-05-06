import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(projectRoot, "src", "assets");
const imageDirs = ["bebidas", "burguers", "pizzas"];
const maxSize = 900;

async function listPngFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listPngFiles(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function optimize(filePath) {
  const outputPath = filePath.replace(/\.png$/i, ".webp");
  const before = (await fs.stat(filePath)).size;

  await sharp(filePath)
    .rotate()
    .resize({
      width: maxSize,
      height: maxSize,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 5 })
    .toFile(outputPath);

  const after = (await fs.stat(outputPath)).size;
  const relative = path.relative(projectRoot, outputPath);
  const saved = before > 0 ? Math.round((1 - after / before) * 100) : 0;
  console.log(`${relative} ${Math.round(after / 1024)} KB (${saved}% menor)`);
}

const pngFiles = (
  await Promise.all(
    imageDirs.map((dir) => listPngFiles(path.join(assetRoot, dir)))
  )
).flat();

await Promise.all(pngFiles.map(optimize));
